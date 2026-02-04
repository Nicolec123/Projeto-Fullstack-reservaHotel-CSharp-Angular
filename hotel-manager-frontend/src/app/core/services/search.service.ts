import { Injectable, signal, computed } from '@angular/core';

export interface SearchParams {
  dataInicio: string;
  dataFim: string;
  hospedes: number;
  quartos: number;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly params = signal<SearchParams>({
    dataInicio: '',
    dataFim: '',
    hospedes: 2,
    quartos: 1
  });

  readonly dataInicio = computed(() => this.params().dataInicio);
  readonly dataFim = computed(() => this.params().dataFim);
  readonly hospedes = computed(() => this.params().hospedes);
  readonly quartos = computed(() => this.params().quartos);
  readonly hasSearch = computed(() => !!(this.params().dataInicio && this.params().dataFim));

  setParams(p: Partial<SearchParams>) {
    this.params.update(current => ({ ...current, ...p }));
  }

  getParams(): SearchParams {
    return this.params();
  }

  clearSearch() {
    this.params.set({
      dataInicio: '',
      dataFim: '',
      hospedes: 2,
      quartos: 1
    });
  }
}
