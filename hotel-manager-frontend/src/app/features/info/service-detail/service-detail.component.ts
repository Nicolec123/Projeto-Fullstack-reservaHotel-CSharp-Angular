import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { getServiceDetail, ServiceDetail } from '../../../core/constants/service-details';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './service-detail.component.html',
  styleUrl: './service-detail.component.css'
})
export class ServiceDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  serviceId = computed(() => this.route.snapshot.paramMap.get('id') || '');
  service = signal<ServiceDetail | null>(null);
  currentImageIndex = signal(0);

  ngOnInit() {
    const id = this.serviceId();
    if (!id) {
      this.router.navigate(['/servicos']);
      return;
    }
    const detail = getServiceDetail(id);
    if (!detail) {
      this.router.navigate(['/servicos']);
      return;
    }
    this.service.set(detail);
  }

  nextImage() {
    const s = this.service();
    if (!s || s.imagens.length <= 1) return;
    this.currentImageIndex.update(i => (i + 1) % s.imagens.length);
  }

  prevImage() {
    const s = this.service();
    if (!s || s.imagens.length <= 1) return;
    this.currentImageIndex.update(i => (i - 1 + s.imagens.length) % s.imagens.length);
  }

  goToImage(index: number) {
    this.currentImageIndex.set(index);
  }
}
