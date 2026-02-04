import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HOTEL_INFO } from '../../../core/constants/hotel-info';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './policies.component.html',
  styleUrl: './policies.component.css'
})
export class PoliciesComponent {
  readonly hotel = HOTEL_INFO;
}
