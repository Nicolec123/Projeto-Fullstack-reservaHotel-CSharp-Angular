import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SearchBarComponent } from '../../shared/search-bar/search-bar.component';
import { HOTEL_INFO } from '../../core/constants/hotel-info';
import { HOME_REVIEWS } from '../../core/constants/home-reviews';
import { SPA_PACKAGES, SPA_REVIEWS } from '../../core/constants/spa-packages';
import { SPA_PILLARS } from '../../core/constants/spa-pillars';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, SearchBarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  readonly hotel = HOTEL_INFO;
  readonly reviews = HOME_REVIEWS;
  readonly spaPackages = SPA_PACKAGES;
  readonly spaReviews = SPA_REVIEWS;
  readonly spaPillars = SPA_PILLARS;
}
