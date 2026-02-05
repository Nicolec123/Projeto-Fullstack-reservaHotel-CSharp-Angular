import { Component, inject, signal, computed } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, Room, Reservation, User, PagedResult } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { HOTEL_INFO } from '../../core/constants/hotel-info';
import { SERVICE_DETAILS, ServiceDetail } from '../../core/constants/service-details';

export type AdminTab = 'dashboard' | 'perfil' | 'rooms' | 'reservations' | 'financeiro' | 'spa' | 'hospedes' | 'avaliacoes' | 'configuracoes' | 'seguranca' | 'colaboradores';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly sanitizer = inject(DomSanitizer);
  readonly auth = inject(AuthService);

  tab = signal<AdminTab>('dashboard');
  rooms = signal<Room[]>([]);
  reservations = signal<Reservation[]>([]);
  allReservationsForDashboard = signal<Reservation[]>([]);
  users = signal<User[]>([]);
  loading = signal(false);
  roomTotal = signal(0);
  resTotal = signal(0);
  userTotal = signal(0);
  page = signal(1);
  pageSize = 10;
  roomError = signal('');
  collabError = signal('');

  readonly hotel = HOTEL_INFO;
  readonly serviceDetails = SERVICE_DETAILS;
  roomForm = this.fb.nonNullable.group({
    numero: ['', Validators.required],
    tipo: ['Standard', Validators.required],
    precoDiaria: [150, [Validators.required, Validators.min(1)]]
  });

  collabForm = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    nivel: ['', Validators.required]
  });

  /** Métricas do dashboard */
  quartosOcupadosHoje = signal(0);
  checkInsHoje = signal(0);
  receitaHoje = signal(0);
  proximasReservas = signal<Reservation[]>([]);

  /** Edição de serviço: "Ver página" com preview + painel admin */
  editingServiceId = signal<string | null>(null);
  serviceStatus = signal<'ativo' | 'manutencao' | 'fechado'>('ativo');
  servicePublishStatus = signal<'publicado' | 'rascunho'>('publicado');

  user = computed(() => this.auth.currentUser());

  /** Dados do perfil do administrador (parte real do auth + parte inventada para exibição) */
  adminProfile = computed(() => {
    const u = this.auth.currentUser();
    return {
      nomeCompleto: u?.nome ?? 'Administrador',
      email: u?.email ?? 'admin@hotel.com',
      cargo: this.roleLabel(u?.role ?? ''),
      nivelPermissao: u?.role === 'Admin' ? 'Super Admin' : 'Staff',
      idAdministrador: 'ADM-2024-001',
      departamento: 'Gerência',
      telefoneInterno: '(11) 3456-7890',
      ramal: '120',
      telefoneMovel: '(11) 99999-1234',
      ultimoLogin: '05/02/2025, 09:42',
      dataCriacaoConta: '15/03/2022',
      ultimaAtualizacao: '28/01/2025',
      idioma: 'Português (Brasil)',
      tema: 'Claro',
      notificacoes: 'Ativadas',
      fusoHorario: 'America/Sao_Paulo (UTC-3)',
      sessoesAtivas: 1,
      logRecente: ['Login no painel — 05/02/2025 09:42', 'Alteração em Quarto 101 — 04/02/2025 14:20', 'Visualização de reservas — 04/02/2025 10:15']
    };
  });

  /** Serviço em edição (detalhe completo) */
  editingService = computed(() => {
    const id = this.editingServiceId();
    return id ? this.getServiceDetail(id) : undefined;
  });

  ngOnInit() {
    this.loadDashboard();
  }

  setTab(t: AdminTab) {
    this.tab.set(t);
    this.page.set(1);
    if (t === 'dashboard') this.loadDashboard();
    else if (t === 'rooms') this.loadRooms();
    else if (t === 'reservations') this.loadReservations();
    else if (t === 'hospedes') this.loadUsers();
  }

  getServiceDetail(id: string | undefined): ServiceDetail | undefined {
    if (!id) return undefined;
    return this.serviceDetails.find(s => s.id === id);
  }

  /** Ícone Material para cada serviço do hotel (seção Configurações) */
  getServiceMaterialIcon(id: string | undefined): string {
    const map: Record<string, string> = {
      piscina: 'pool',
      academia: 'fitness_center',
      restaurante: 'restaurant',
      spa: 'spa',
      estacionamento: 'local_parking',
      wifi: 'wifi',
      'room-service': 'room_service',
      transfer: 'flight',
      eventos: 'celebration'
    };
    return map[id ?? ''] ?? 'miscellaneous_services';
  }

  openServiceEdit(serviceId: string): void {
    this.editingServiceId.set(serviceId);
    this.serviceStatus.set('ativo');
    this.servicePublishStatus.set('publicado');
  }

  closeServiceEdit(): void {
    this.editingServiceId.set(null);
  }

  saveServiceEdits(): void {
    // Em produção: enviaria ao backend
    this.closeServiceEdit();
  }

  /** URL do preview público do serviço (para iframe) */
  servicoPreviewUrl(serviceId: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl('/servicos/' + serviceId);
  }

  private todayStr(): string {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  loadDashboard() {
    this.loading.set(true);
    forkJoin({
      rooms: this.api.getRooms(1, 500),
      reservations: this.api.getAllReservations(1, 500),
      users: this.api.getUsers(1, 1)
    }).subscribe({
      next: ({ rooms, reservations, users }) => {
        this.roomTotal.set(rooms.total);
        this.resTotal.set(reservations.total);
        this.userTotal.set(users.total);
        this.allReservationsForDashboard.set(reservations.items);
        this.computeDashboardMetrics(rooms.items, reservations.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private computeDashboardMetrics(rooms: Room[], reservations: Reservation[]) {
    const today = this.todayStr();
    const ocupadosHoje = reservations.filter(r => {
      const inicio = r.dataInicio.slice(0, 10);
      const fim = r.dataFim.slice(0, 10);
      return inicio <= today && fim >= today && r.status !== 'Cancelada';
    });
    const checkIns = reservations.filter(r => r.dataInicio.slice(0, 10) === today && r.status !== 'Cancelada');
    let receita = 0;
    reservations.filter(r => r.dataInicio.slice(0, 10) === today && r.status !== 'Cancelada').forEach(r => {
      receita += r.precoTotal ?? 0;
    });
    const proximas = reservations
      .filter(r => r.dataInicio >= today && r.status !== 'Cancelada')
      .sort((a, b) => a.dataInicio.localeCompare(b.dataInicio))
      .slice(0, 5);

    this.quartosOcupadosHoje.set(ocupadosHoje.length);
    this.checkInsHoje.set(checkIns.length);
    this.receitaHoje.set(receita);
    this.proximasReservas.set(proximas);
  }

  taxaOcupacao(): string {
    const total = this.roomTotal();
    const ocupados = this.quartosOcupadosHoje();
    if (total === 0) return '0%';
    return Math.round((ocupados / total) * 100) + '%';
  }

  loadRooms() {
    this.loading.set(true);
    this.api.getRooms(this.page(), this.pageSize).subscribe({
      next: (res: PagedResult<Room>) => {
        this.rooms.set(res.items);
        this.roomTotal.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadReservations() {
    this.loading.set(true);
    this.api.getAllReservations(this.page(), this.pageSize).subscribe({
      next: (res: PagedResult<Reservation>) => {
        this.reservations.set(res.items);
        this.resTotal.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadUsers() {
    this.loading.set(true);
    this.api.getUsers(this.page(), this.pageSize).subscribe({
      next: (res: PagedResult<User>) => {
        this.users.set(res.items);
        this.userTotal.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleBlock(room: Room) {
    this.api.updateRoom(room.id, { bloqueado: !room.bloqueado }).subscribe({
      next: () => this.loadRooms()
    });
  }

  createRoom() {
    if (this.roomForm.invalid) return;
    this.roomError.set('');
    this.api.createRoom(this.roomForm.getRawValue()).subscribe({
      next: () => {
        this.roomForm.reset({ numero: '', tipo: 'Standard', precoDiaria: 150 });
        this.loadRooms();
      },
      error: (err: any) => this.roomError.set(err.error?.message || 'Erro ao cadastrar quarto.')
    });
  }

  createCollaborator() {
    if (this.collabForm.invalid) return;
    this.collabError.set('');
    this.api.createCollaborator(this.collabForm.getRawValue()).subscribe({
      next: () => {
        this.collabForm.reset({ nome: '', email: '', senha: '', nivel: '' });
        this.loadUsers();
      },
      error: (err: any) => this.collabError.set(err.error?.message || 'Erro ao adicionar colaborador.')
    });
  }

  totalPages(): number {
    const t = this.tab();
    if (t === 'dashboard' || t === 'perfil' || t === 'colaboradores' || t === 'configuracoes' || t === 'financeiro' || t === 'spa' || t === 'avaliacoes' || t === 'seguranca') return 1;
    const total = t === 'rooms' ? this.roomTotal() : t === 'reservations' ? this.resTotal() : this.userTotal();
    return Math.ceil(total / this.pageSize) || 1;
  }

  goPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    const t = this.tab();
    if (t === 'rooms') this.loadRooms();
    else if (t === 'reservations') this.loadReservations();
    else if (t === 'hospedes') this.loadUsers();
  }

  formatDate(s: string) {
    return new Date(s).toLocaleDateString('pt-BR');
  }

  formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  roleLabel(role: string): string {
    const map: Record<string, string> = {
      'Admin': 'Super Admin',
      'Gerente': 'Gerente',
      'Recepcionista': 'Recepção',
      'User': 'Hóspede'
    };
    return map[role] ?? role;
  }
}
