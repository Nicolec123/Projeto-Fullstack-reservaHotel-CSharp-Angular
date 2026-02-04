import { Component, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, Room, Reservation, User, PagedResult } from '../../core/services/api.service';
import { HOTEL_INFO } from '../../core/constants/hotel-info';
import { SERVICE_DETAILS, ServiceDetail } from '../../core/constants/service-details';

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

  tab = signal<'inicio' | 'rooms' | 'reservations' | 'users' | 'services'>('inicio');
  rooms = signal<Room[]>([]);
  reservations = signal<Reservation[]>([]);
  users = signal<User[]>([]);
  loading = signal(false);
  roomTotal = signal(0);
  resTotal = signal(0);
  userTotal = signal(0);
  page = signal(1);
  pageSize = 10;
  roomError = signal('');
  
  readonly hotel = HOTEL_INFO;
  readonly serviceDetails = SERVICE_DETAILS;
  roomForm = this.fb.nonNullable.group({
    numero: ['', Validators.required],
    tipo: ['Standard', Validators.required],
    precoDiaria: [150, [Validators.required, Validators.min(1)]]
  });

  ngOnInit() {
    this.loadDashboard();
  }

  setTab(t: 'inicio' | 'rooms' | 'reservations' | 'users' | 'services') {
    this.tab.set(t);
    this.page.set(1);
    if (t === 'inicio') this.loadDashboard();
    else if (t === 'rooms') this.loadRooms();
    else if (t === 'reservations') this.loadReservations();
    else if (t === 'users') this.loadUsers();
  }

  getServiceDetail(id: string | undefined): ServiceDetail | undefined {
    if (!id) return undefined;
    return this.serviceDetails.find(s => s.id === id);
  }

  loadDashboard() {
    this.loading.set(true);
    forkJoin({
      rooms: this.api.getRooms(1, 1),
      reservations: this.api.getAllReservations(1, 1),
      users: this.api.getUsers(1, 1)
    }).subscribe({
      next: ({ rooms, reservations, users }) => {
        this.roomTotal.set(rooms.total);
        this.resTotal.set(reservations.total);
        this.userTotal.set(users.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
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

  totalPages() {
    const t = this.tab();
    if (t === 'inicio') return 1;
    const total = t === 'rooms' ? this.roomTotal() : t === 'reservations' ? this.resTotal() : this.userTotal();
    return Math.ceil(total / this.pageSize) || 1;
  }

  goPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    const t = this.tab();
    if (t === 'rooms') this.loadRooms();
    else if (t === 'reservations') this.loadReservations();
    else if (t === 'users') this.loadUsers();
  }

  formatDate(s: string) {
    return new Date(s).toLocaleDateString('pt-BR');
  }
}
