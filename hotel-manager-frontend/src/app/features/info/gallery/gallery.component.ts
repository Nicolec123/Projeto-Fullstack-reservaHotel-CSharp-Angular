import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GALLERY_IMAGES } from '../../../core/constants/gallery-images';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})
export class GalleryComponent {
  readonly images = GALLERY_IMAGES;
  selected = signal<number | null>(null);

  open(i: number) {
    this.selected.set(i);
  }

  close() {
    this.selected.set(null);
  }

  next() {
    const i = this.selected();
    if (i === null) return;
    this.selected.set((i + 1) % this.images.length);
  }

  prev() {
    const i = this.selected();
    if (i === null) return;
    this.selected.set((i - 1 + this.images.length) % this.images.length);
  }
}
