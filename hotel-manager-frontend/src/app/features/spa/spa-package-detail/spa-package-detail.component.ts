import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { getSpaPackage, SpaPackage } from '../../../core/constants/spa-packages';
import { getSpaPackageDetail, getSpaPackageImages, SpaPackageDetail } from '../../../core/constants/spa-package-details';
import { SPA_REVIEWS } from '../../../core/constants/spa-packages';

@Component({
  selector: 'app-spa-package-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './spa-package-detail.component.html',
  styleUrl: './spa-package-detail.component.css'
})
export class SpaPackageDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);

  packageId = signal<string | null>(null);
  packageData = signal<SpaPackage | null>(null);
  packageDetail = signal<SpaPackageDetail | null>(null);
  loading = signal(true);
  imageIndex = signal(0);
  roomImageIndex = signal(0);

  readonly getSpaPackageImages = getSpaPackageImages;
  readonly spaReviews = SPA_REVIEWS;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.packageId.set(id);
      const pkg = getSpaPackage(id);
      if (pkg) {
        this.packageData.set(pkg);
        const detail = getSpaPackageDetail(id);
        if (detail) {
          this.packageDetail.set(detail);
        }
      } else {
        this.router.navigate(['/']);
      }
    } else {
      this.router.navigate(['/']);
    }
    this.loading.set(false);
  }

  prevImage() {
    const detail = this.packageDetail();
    if (!detail) return;
    const images = detail.imagens;
    if (images.length > 0) {
      this.imageIndex.set((this.imageIndex() - 1 + images.length) % images.length);
    }
  }

  nextImage() {
    const detail = this.packageDetail();
    if (!detail) return;
    const images = detail.imagens;
    if (images.length > 0) {
      this.imageIndex.set((this.imageIndex() + 1) % images.length);
    }
  }

  prevRoomImage() {
    const detail = this.packageDetail();
    if (!detail || !detail.imagensQuarto) return;
    const images = detail.imagensQuarto;
    if (images.length > 0) {
      this.roomImageIndex.set((this.roomImageIndex() - 1 + images.length) % images.length);
    }
  }

  nextRoomImage() {
    const detail = this.packageDetail();
    if (!detail || !detail.imagensQuarto) return;
    const images = detail.imagensQuarto;
    if (images.length > 0) {
      this.roomImageIndex.set((this.roomImageIndex() + 1) % images.length);
    }
  }

  formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  irParaReserva() {
    const id = this.packageId();
    if (id) {
      this.router.navigate(['/spa/pacote', id]);
    }
  }
}
