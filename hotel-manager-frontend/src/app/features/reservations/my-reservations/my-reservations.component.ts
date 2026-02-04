import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Reservation } from '../../../core/services/api.service';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-reservations.component.html',
  styleUrl: './my-reservations.component.css'
})
export class MyReservationsComponent {
  private readonly api = inject(ApiService);

  reservations = signal<Reservation[]>([]);
  total = signal(0);
  page = signal(1);
  pageSize = 10;
  loading = signal(true);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.getMyReservations(this.page(), this.pageSize).subscribe({
      next: (res) => {
        this.reservations.set(res.items);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  cancel(id: number) {
    if (!confirm('Cancelar esta reserva?')) return;
    this.api.cancelReservation(id).subscribe({
      next: () => this.load()
    });
  }

  totalPages() {
    return Math.ceil(this.total() / this.pageSize) || 1;
  }

  goPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.load();
  }

  formatDate(s: string) {
    return new Date(s).toLocaleDateString('pt-BR');
  }
}
