import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, Room } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReservationStateService } from '../../../core/services/reservation-state.service';
import { SPA_ADDONS, SpaAddOn } from '../../../core/constants/spa-addons';
import { SPA_BOOKING_PACKAGES, SpaBookingPackage, calculateSpaPackagePrice } from '../../../core/constants/spa-booking-packages';

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
  private readonly reservationState = inject(ReservationStateService);

  room = signal<Room | null>(null);
  loading = signal(true);
  selectedSpa = signal<SpaAddOn | null>(null);
  selectedPackage = signal<SpaBookingPackage | null>(null);
  packageNumPessoas = signal(1);

  readonly spaOptions = SPA_ADDONS;
  readonly spaPackages = SPA_BOOKING_PACKAGES;
  readonly getRoomImageUrl = getRoomImageUrl;
  readonly calculateSpaPackagePrice = calculateSpaPackagePrice;

  roomId = computed(() => Number(this.route.snapshot.paramMap.get('id')));

  /** Simulação: 1 noite + quarto + spa (se escolhido) */
  totalSimulacao = computed(() => {
    const r = this.room();
    const spa = this.selectedSpa();
    const pkg = this.selectedPackage();
    if (!r) return 0;
    const spaValor = spa ? spa.preco : 0;
    const packageValor = pkg ? calculateSpaPackagePrice(pkg.id, this.packageNumPessoas()) : 0;
    return Number(r.precoDiaria) + spaValor + packageValor;
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
    if (spa) {
      this.selectedPackage.set(null);
    }
  }

  selectPackage(pkg: SpaBookingPackage | null) {
    this.selectedPackage.set(pkg);
    if (pkg) {
      this.selectedSpa.set(null);
      this.packageNumPessoas.set(pkg.pessoasIncluidas);
    }
  }

  updatePackagePessoas(num: number) {
    const pkg = this.selectedPackage();
    if (pkg && pkg.pessoasMaximas && num > pkg.pessoasMaximas) {
      return;
    }
    if (pkg && num < pkg.pessoasIncluidas) {
      return;
    }
    this.packageNumPessoas.set(num);
  }

  irParaReserva() {
    const r = this.room();
    if (!r || r.bloqueado) return;
    const spa = this.selectedSpa();
    const pkg = this.selectedPackage();
    const queryParams: any = {};
    if (spa) {
      queryParams.spa = spa.id;
    } else if (pkg) {
      queryParams.spaPackage = pkg.id;
      queryParams.spaPessoas = this.packageNumPessoas();
    }
    const reserveUrl = `/reservar/${r.id}`;
    
    if (this.auth.isLoggedIn() && !this.auth.isAdmin()) {
      this.router.navigate(['/reservar', r.id], { queryParams });
    } else {
      // Salvar estado pendente antes de redirecionar
      this.reservationState.savePendingState(reserveUrl, queryParams);
      const returnUrl = `${reserveUrl}${Object.keys(queryParams).length > 0 ? '?' + new URLSearchParams(queryParams).toString() : ''}`;
      this.router.navigate(['/login'], { queryParams: { returnUrl } });
    }
  }

  formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  apenasQuarto() {
    const r = this.room();
    if (!r || r.bloqueado) return;
    const reserveUrl = `/reservar/${r.id}`;
    
    if (this.auth.isLoggedIn() && !this.auth.isAdmin()) {
      this.router.navigate(['/reservar', r.id]);
    } else {
      // Salvar estado pendente antes de redirecionar
      this.reservationState.savePendingState(reserveUrl);
      this.router.navigate(['/login'], { queryParams: { returnUrl: reserveUrl } });
    }
  }
}
