import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SearchService } from '../../core/services/search.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {
  private readonly search = inject(SearchService);
  private readonly router = inject(Router);

  compact = input<boolean>(false);

  dataInicio = '';
  dataFim = '';
  hospedes = 2;
  quartos = 1;

  searchClick = output<void>();

  buscar() {
    if (!this.dataInicio || !this.dataFim) return;
    const d1 = new Date(this.dataInicio);
    const d2 = new Date(this.dataFim);
    if (d2 <= d1) return;
    this.search.setParams({
      dataInicio: this.dataInicio,
      dataFim: this.dataFim,
      hospedes: this.hospedes,
      quartos: this.quartos
    });
    this.router.navigate(['/quartos'], { queryParams: { buscar: '1' } });
    this.searchClick.emit();
  }
}
