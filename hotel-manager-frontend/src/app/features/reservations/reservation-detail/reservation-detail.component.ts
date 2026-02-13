import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, Reservation, CancellationInfo } from '../../../core/services/api.service';
import { SearchService } from '../../../core/services/search.service';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reservation-detail.component.html',
  styleUrl: './reservation-detail.component.css'
})
export class ReservationDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly search = inject(SearchService);

  reservation = signal<Reservation | null>(null);
  loading = signal(true);
  error = signal('');
  cancelling = signal(false);

  /** Modal de cancelamento: exibe custo (regra 48h) e pede confirmação */
  showCancelModal = signal(false);
  cancelInfo = signal<CancellationInfo | null>(null);
  cancelModalLoading = signal(false);
  cancelModalError = signal('');
  cancelToken = signal('');

  reservationId = computed(() => Number(this.route.snapshot.paramMap.get('id')));

  get canCancelOrReschedule(): boolean {
    const r = this.reservation();
    if (!r) return false;
    const status = (r.status || '').toLowerCase();
    return status !== 'cancelada';
  }

  ngOnInit() {
    const id = this.reservationId();
    if (!id) {
      this.router.navigate(['/minhas-reservas']);
      return;
    }
    this.api.getReservation(id).subscribe({
      next: (r) => this.reservation.set(r),
      error: () => {
        this.error.set('Reserva não encontrada.');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false)
    });
  }

  formatDate(s: string): string {
    return new Date(s).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatDateShort(s: string): string {
    return new Date(s).toLocaleDateString('pt-BR');
  }

  /** Abre o modal de cancelamento: busca info da regra 48h e exibe custo se houver */
  openCancelModal() {
    const r = this.reservation();
    if (!r) return;
    this.cancelModalError.set('');
    this.cancelToken.set('');
    this.api.getCancellationInfo(r.id).subscribe({
      next: (info) => {
        this.cancelInfo.set(info);
        this.showCancelModal.set(true);
      },
      error: () => this.cancelModalError.set('Não foi possível carregar as informações de cancelamento.')
    });
  }

  closeCancelModal() {
    this.showCancelModal.set(false);
    this.cancelInfo.set(null);
    this.cancelModalError.set('');
    this.cancelToken.set('');
  }

  /** Confirma cancelamento: se houver taxa, envia token; backend cobra 1 diária e cancela */
  confirmCancel() {
    const r = this.reservation();
    const info = this.cancelInfo();
    if (!r || !info) return;
    if (info.aplicaTaxa && info.valorTaxa > 0 && !this.cancelToken().trim()) {
      this.cancelModalError.set('Informe o token de pagamento para cobrança da taxa de 1 diária.');
      return;
    }
    this.cancelModalLoading.set(true);
    this.cancelModalError.set('');
    const body = info.aplicaTaxa && this.cancelToken().trim() ? { tokenPagamento: this.cancelToken().trim() } : undefined;
    this.api.cancelReservation(r.id, body).subscribe({
      next: (updated) => {
        this.reservation.set(updated);
        this.closeCancelModal();
        this.cancelModalLoading.set(false);
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

  reagendar() {
    const r = this.reservation();
    if (!r) return;
    const dataInicio = r.dataInicio.slice(0, 10);
    const dataFim = r.dataFim.slice(0, 10);
    this.search.setParams({ dataInicio, dataFim, hospedes: 2, quartos: 1 });
    // Passa o ID da reserva existente via query param para excluí-la da validação de conflito
    this.router.navigate(['/reservar', r.roomId], { queryParams: { reagendar: r.id } });
  }
}
