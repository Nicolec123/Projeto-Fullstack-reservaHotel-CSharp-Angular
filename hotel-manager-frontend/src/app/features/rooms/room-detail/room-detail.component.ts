import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, Room } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { getRoomImages } from '../../../core/constants/room-images';
import { getRoomDescription } from '../../../core/constants/room-descriptions';
import { getRoomReviews } from '../../../core/constants/room-reviews';
import { getWhatsAppUrl } from '../../../core/constants/contact';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.css'
})
export class RoomDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  room = signal<Room | null>(null);
  loading = signal(true);
  imageIndex = signal(0);

  readonly getRoomImages = getRoomImages;
  readonly getRoomReviews = getRoomReviews;

  roomId = computed(() => Number(this.route.snapshot.paramMap.get('id')));

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

  getDescription(tipo: string) {
    return getRoomDescription(tipo);
  }

  getWhatsAppUrl(room: Room): string {
    return getWhatsAppUrl(`Olá! Gostaria de mais informações sobre o Quarto ${room.numero} (${room.tipo}).`);
  }

  goToReserve(room: Room) {
    if (this.auth.isLoggedIn() && !room.bloqueado) {
      this.router.navigate(['/reservar', room.id]);
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/reservar/${room.id}` } });
    }
  }

  nextImage() {
    const room = this.room();
    if (!room) return;
    const imgs = this.getRoomImages(room.numero);
    if (imgs.length <= 1) return;
    this.imageIndex.update(i => (i + 1) % imgs.length);
  }

  prevImage() {
    const room = this.room();
    if (!room) return;
    const imgs = this.getRoomImages(room.numero);
    if (imgs.length <= 1) return;
    this.imageIndex.update(i => (i - 1 + imgs.length) % imgs.length);
  }
}
