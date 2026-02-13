import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SPA_BOOKING_PACKAGES, SpaBookingPackage } from '../../../core/constants/spa-booking-packages';

interface SpaAppointment {
  id: number;
  clienteNome: string;
  clienteEmail: string;
  pacote: string;
  dataAgendamento: string;
  horario: string;
  numPessoas: number;
  valorTotal: number;
  status: 'confirmado' | 'pendente' | 'cancelado' | 'concluido';
  observacoes?: string;
}

interface BlockedTimeSlot {
  id: number;
  data: string;
  horario: string;
  motivo: string;
  criadoPor: string;
  criadoEm: string;
}

@Component({
  selector: 'app-spa-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './spa-admin.component.html',
  styleUrl: './spa-admin.component.css'
})
export class SpaAdminComponent {
  private readonly fb = inject(FormBuilder);

  /** Abas: 'agendamentos' | 'horarios' | 'pacotes' | 'estatisticas' */
  activeTab = signal<'agendamentos' | 'horarios' | 'pacotes' | 'estatisticas'>('agendamentos');
  
  // Dados simulados (em produção viriam da API)
  appointments = signal<SpaAppointment[]>([
    {
      id: 1,
      clienteNome: 'Maria Silva',
      clienteEmail: 'maria@email.com',
      pacote: 'Pacote Casal',
      dataAgendamento: '2026-02-15',
      horario: '14:00',
      numPessoas: 2,
      valorTotal: 650,
      status: 'confirmado',
      observacoes: 'Aniversário de casamento'
    },
    {
      id: 2,
      clienteNome: 'João Santos',
      clienteEmail: 'joao@email.com',
      pacote: 'Pacote Individual',
      dataAgendamento: '2026-02-16',
      horario: '10:00',
      numPessoas: 1,
      valorTotal: 350,
      status: 'pendente'
    }
  ]);

  blockedTimeSlots = signal<BlockedTimeSlot[]>([
    {
      id: 1,
      data: '2026-02-20',
      horario: '15:00',
      motivo: 'Manutenção',
      criadoPor: 'Admin',
      criadoEm: '2026-02-10T10:00:00'
    }
  ]);

  readonly packages = SPA_BOOKING_PACKAGES;
  
  loading = signal(false);
  error = signal('');
  
  // Filtros
  filterStatus = signal<string>('todos');
  filterDate = signal<string>('');
  
  // Formulário para bloquear horário
  blockTimeForm = this.fb.nonNullable.group({
    data: ['', Validators.required],
    horario: ['', Validators.required],
    motivo: ['', Validators.required]
  });

  // Estatísticas calculadas
  stats = computed(() => {
    const apps = this.appointments();
    const hoje = new Date().toISOString().split('T')[0];
    
    return {
      totalAgendamentos: apps.length,
      confirmados: apps.filter(a => a.status === 'confirmado').length,
      pendentes: apps.filter(a => a.status === 'pendente').length,
      cancelados: apps.filter(a => a.status === 'cancelado').length,
      concluidos: apps.filter(a => a.status === 'concluido').length,
      hoje: apps.filter(a => a.dataAgendamento === hoje).length,
      receitaTotal: apps.reduce((sum, a) => sum + a.valorTotal, 0),
      receitaMes: apps
        .filter(a => {
          const data = new Date(a.dataAgendamento);
          const hoje = new Date();
          return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
        })
        .reduce((sum, a) => sum + a.valorTotal, 0)
    };
  });

  filteredAppointments = computed(() => {
    let filtered = this.appointments();
    
    if (this.filterStatus() !== 'todos') {
      filtered = filtered.filter(a => a.status === this.filterStatus());
    }
    
    if (this.filterDate()) {
      filtered = filtered.filter(a => a.dataAgendamento === this.filterDate());
    }
    
    return filtered.sort((a, b) => {
      const dateCompare = a.dataAgendamento.localeCompare(b.dataAgendamento);
      if (dateCompare !== 0) return dateCompare;
      return a.horario.localeCompare(b.horario);
    });
  });

  horariosDisponiveis = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00'
  ];

  setTab(tab: 'agendamentos' | 'horarios' | 'pacotes' | 'estatisticas') {
    this.activeTab.set(tab);
  }

  formatDate(date: string): string {
    return new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      'confirmado': 'badge-success',
      'pendente': 'badge-warning',
      'cancelado': 'badge-danger',
      'concluido': 'badge-info'
    };
    return map[status] || 'badge-default';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'confirmado': 'Confirmado',
      'pendente': 'Pendente',
      'cancelado': 'Cancelado',
      'concluido': 'Concluído'
    };
    return map[status] || status;
  }

  updateAppointmentStatus(id: number, status: SpaAppointment['status']) {
    // Em produção: chamaria API
    this.appointments.update(apps => 
      apps.map(a => a.id === id ? { ...a, status } : a)
    );
  }

  blockTimeSlot() {
    if (this.blockTimeForm.invalid) {
      this.error.set('Preencha todos os campos obrigatórios.');
      return;
    }

    const formValue = this.blockTimeForm.getRawValue();
    
    // Verificar se já existe bloqueio
    const exists = this.blockedTimeSlots().some(
      b => b.data === formValue.data && b.horario === formValue.horario
    );

    if (exists) {
      this.error.set('Este horário já está bloqueado.');
      return;
    }

    const newBlock: BlockedTimeSlot = {
      id: Date.now(),
      data: formValue.data,
      horario: formValue.horario,
      motivo: formValue.motivo,
      criadoPor: 'Admin', // Em produção: pegar do auth
      criadoEm: new Date().toISOString()
    };

    this.blockedTimeSlots.update(blocks => [...blocks, newBlock]);
    this.blockTimeForm.reset();
    this.error.set('');
  }

  removeBlockedTimeSlot(id: number) {
    this.blockedTimeSlots.update(blocks => blocks.filter(b => b.id !== id));
  }

  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getMaxDate(): string {
    const futuro = new Date();
    futuro.setMonth(futuro.getMonth() + 3);
    return futuro.toISOString().split('T')[0];
  }

  getAppointmentCountByPackage(packageName: string): number {
    return this.appointments().filter(a => a.pacote === packageName).length;
  }
}
