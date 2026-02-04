import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HOTEL_INFO } from '../../core/constants/hotel-info';
import { getWhatsAppUrl } from '../../core/constants/contact';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  readonly hotel = HOTEL_INFO;
  readonly year = new Date().getFullYear();

  getWhatsAppUrl = getWhatsAppUrl;
}
