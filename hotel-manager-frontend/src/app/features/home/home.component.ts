import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SearchBarComponent } from '../../shared/search-bar/search-bar.component';
import { AuthService } from '../../core/services/auth.service';
import { HOTEL_INFO } from '../../core/constants/hotel-info';
import { HOME_REVIEWS } from '../../core/constants/home-reviews';
import { SPA_PACKAGES, SPA_REVIEWS } from '../../core/constants/spa-packages';
import { SPA_PILLARS, SpaPillar } from '../../core/constants/spa-pillars';
import { SPA_BOOKING_PACKAGES, SpaBookingPackage } from '../../core/constants/spa-booking-packages';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, SearchBarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  ngOnInit(): void {
    if (this.auth.isStaff()) {
      this.router.navigate(['/admin']);
    }
  }

  readonly hotel = HOTEL_INFO;
  readonly reviews = HOME_REVIEWS;
  readonly spaPackages = SPA_PACKAGES;
  readonly spaReviews = SPA_REVIEWS;
  readonly spaPillars = SPA_PILLARS;
  readonly spaBookingPackages = SPA_BOOKING_PACKAGES;
  
  selectedPillar: SpaPillar | null = null;
  isModalOpen = false;

  openModal(pillar: SpaPillar): void {
    this.selectedPillar = pillar;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedPillar = null;
    document.body.style.overflow = '';
  }

  agendarSpa(pacoteId?: string): void {
    if (pacoteId) {
      this.router.navigate(['/spa/agendar'], { queryParams: { pacote: pacoteId } });
    } else {
      this.router.navigate(['/spa/agendar']);
    }
  }

  verDetalhesPacotePromocional(pacoteId: string): void {
    this.router.navigate(['/spa/pacote', pacoteId]);
  }

  formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }
}
