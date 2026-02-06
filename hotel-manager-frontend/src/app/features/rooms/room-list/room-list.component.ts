import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService, Room } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { SearchService } from '../../../core/services/search.service';
import { SearchBarComponent } from '../../../shared/search-bar/search-bar.component';
import { getRoomImages } from '../../../core/constants/room-images';
import { getRoomDescription } from '../../../core/constants/room-descriptions';
import { getWhatsAppUrl } from '../../../core/constants/contact';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, RouterLink, SearchBarComponent],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.css'
})
export class RoomListComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly search = inject(SearchService);
  readonly auth = inject(AuthService);
  readonly getRoomImages = getRoomImages;

  roomImageIndices = signal<Record<number, number>>({});

  rooms = signal<Room[]>([]);
  total = signal(0);
  page = signal(1);
  pageSize = 10;
  loading = signal(true);
  dataInicio = signal('');
  dataFim = signal('');
  checkAvailability = signal(false);

  totalPages = computed(() => Math.ceil(this.total() / this.pageSize) || 1);

  ngOnInit() {
    const buscar = this.route.snapshot.queryParams['buscar'];
    const params = this.search.getParams();
    if (buscar === '1' && params.dataInicio && params.dataFim) {
      this.dataInicio.set(params.dataInicio);
      this.dataFim.set(params.dataFim);
      this.checkAvailability.set(true);
    }
    this.load();
  }

  load() {
    this.loading.set(true);
    if (this.checkAvailability() && this.dataInicio() && this.dataFim()) {
      this.api.getAvailableRooms(this.dataInicio(), this.dataFim()).subscribe({
        next: (list) => {
          this.rooms.set(list);
          this.total.set(list.length);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.api.getRooms(this.page(), this.pageSize).subscribe({
        next: (res) => {
          this.rooms.set(res.items);
          this.total.set(res.total);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  goPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.load();
  }

  getImageIndex(roomId: number): number {
    return this.roomImageIndices()[roomId] ?? 0;
  }

  nextImage(room: Room) {
    const imgs = this.getRoomImages(room.numero);
    if (imgs.length <= 1) return;
    const curr = this.getImageIndex(room.id);
    const next = (curr + 1) % imgs.length;
    this.roomImageIndices.update(m => ({ ...m, [room.id]: next }));
  }

  prevImage(room: Room) {
    const imgs = this.getRoomImages(room.numero);
    if (imgs.length <= 1) return;
    const curr = this.getImageIndex(room.id);
    const next = (curr - 1 + imgs.length) % imgs.length;
    this.roomImageIndices.update(m => ({ ...m, [room.id]: next }));
  }

  setImageIndex(room: Room, index: number) {
    this.roomImageIndices.update(m => ({ ...m, [room.id]: index }));
  }

  getResumo(tipo: string): string {
    return getRoomDescription(tipo).resumo;
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
}
