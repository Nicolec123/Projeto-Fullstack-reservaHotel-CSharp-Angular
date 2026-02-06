import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Reservation, CancellationInfo } from '../../../core/services/api.service';

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

  /** Modal de cancelamento (regra 48h) */
  showCancelModal = signal(false);
  cancelReservationId = signal(0);
  cancelInfo = signal<CancellationInfo | null>(null);
  cancelModalLoading = signal(false);
  cancelModalError = signal('');
  cancelToken = signal('');

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

  /** Abre modal de cancelamento e carrega info da taxa (48h) */
  openCancelModal(id: number) {
    this.cancelReservationId.set(id);
    this.cancelModalError.set('');
    this.cancelToken.set('');
    this.api.getCancellationInfo(id).subscribe({
      next: (info) => {
        this.cancelInfo.set(info);
        this.showCancelModal.set(true);
      },
      error: () => this.cancelModalError.set('Não foi possível carregar as informações de cancelamento.')
    });
  }

  closeCancelModal() {
    this.showCancelModal.set(false);
    this.cancelReservationId.set(0);
    this.cancelInfo.set(null);
    this.cancelModalError.set('');
    this.cancelToken.set('');
  }

  confirmCancel() {
    const id = this.cancelReservationId();
    const info = this.cancelInfo();
    if (!id || !info) return;
    if (info.aplicaTaxa && info.valorTaxa > 0 && !this.cancelToken().trim()) {
      this.cancelModalError.set('Informe o token de pagamento para cobrança da taxa de 1 diária.');
      return;
    }
    this.cancelModalLoading.set(true);
    this.cancelModalError.set('');
    const body = info.aplicaTaxa && this.cancelToken().trim() ? { tokenPagamento: this.cancelToken().trim() } : undefined;
    this.api.cancelReservation(id, body).subscribe({
      next: () => {
        this.closeCancelModal();
        this.cancelModalLoading.set(false);
        this.load();
      },
      error: (err) => {
        this.cancelModalLoading.set(false);
        const msg = err.status === 402
          ? `Pagamento obrigatório: R$ ${err.error?.feeAmount ?? info.valorTaxa} (1 diária).`
          : (err.error?.message || 'Falha ao cancelar. Tente novamente.');
        this.cancelModalError.set(msg);
      }
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
