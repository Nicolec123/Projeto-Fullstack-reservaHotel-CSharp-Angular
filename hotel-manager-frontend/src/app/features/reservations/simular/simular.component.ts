import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, Room } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { SPA_ADDONS, SpaAddOn } from '../../../core/constants/spa-addons';
import { getRoomImageUrl } from '../../../core/constants/room-images';

@Component({
  selector: 'app-simular',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './simular.component.html',
  styleUrl: './simular.component.css'
})
export class SimularComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  room = signal<Room | null>(null);
  loading = signal(true);
  selectedSpa = signal<SpaAddOn | null>(null);

  readonly spaOptions = SPA_ADDONS;
  readonly getRoomImageUrl = getRoomImageUrl;

  roomId = computed(() => Number(this.route.snapshot.paramMap.get('id')));

  /** Simulação: 1 noite + quarto + spa (se escolhido) */
  totalSimulacao = computed(() => {
    const r = this.room();
    const spa = this.selectedSpa();
    if (!r) return 0;
    return Number(r.precoDiaria) + (spa ? spa.preco : 0);
  });

  ngOnInit() {
    const id = this.roomId();
    if (!id) {
      this.router.navigate(['/quartos']);
      return;
    }
    this.api.getRoom(id).subscribe({
      next: (r) => this.room.set(r),
      error: () => this.router.navigate(['/quartos']),
      complete: () => this.loading.set(false)
    });
  }

  selectSpa(spa: SpaAddOn | null) {
    this.selectedSpa.set(spa);
  }

  irParaReserva() {
    const r = this.room();
    if (!r || r.bloqueado) return;
    const spa = this.selectedSpa();
    const returnUrl = spa ? `/reservar/${r.id}?spa=${spa.id}` : `/reservar/${r.id}`;
    if (this.auth.isLoggedIn() && !this.auth.isAdmin()) {
      this.router.navigate(['/reservar', r.id], { queryParams: spa ? { spa: spa.id } : {} });
    } else if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl } });
    }
  }

  apenasQuarto() {
    const r = this.room();
    if (!r || r.bloqueado) return;
    if (this.auth.isLoggedIn() && !this.auth.isAdmin()) {
      this.router.navigate(['/reservar', r.id]);
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/reservar/${r.id}` } });
    }
  }
}
