import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup } from '@angular/forms';
import { ApiService, Room } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { SearchService } from '../../../core/services/search.service';
import { getRoomImageUrl } from '../../../core/constants/room-images';
import { getSpaAddOn, SpaAddOn } from '../../../core/constants/spa-addons';

@Component({
  selector: 'app-reserve',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reserve.component.html',
  styleUrl: './reserve.component.css'
})
export class ReserveComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly search = inject(SearchService);
  readonly auth = inject(AuthService);

  room = signal<Room | null>(null);
  reservationId = signal<number | null>(null);
  /** Pacote de spa escolhido na simulação (vem por queryParam ?spa=id) */
  spaAddOn = signal<SpaAddOn | null>(null);
  readonly getRoomImageUrl = getRoomImageUrl;
  loading = signal(true);
  submitting = signal(false);
  error = signal('');

  /** 1 = Datas | 2 = Dados hóspede | 3 = Revisão/Pagamento | 4 = Sucesso */
  step = signal(1);

  form = this.fb.nonNullable.group({
    dataInicio: ['', Validators.required],
    dataFim: ['', Validators.required],
    periodoCheckIn: ['Tarde'], // Manhã, Tarde, Noite
    periodoCheckOut: ['Manhã'],
    telefone: [''],
    adultos: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
    criancas: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
    pets: [0, [Validators.required, Validators.min(0), Validators.max(3)]],
    observacoes: [''],
    metodoPagamento: [''],
    tokenPagamento: [''],
    guests: this.fb.array<FormGroup>([])
  });

  roomId = computed(() => Number(this.route.snapshot.paramMap.get('id')));

  /** Número de noites: reavaliado a cada detecção de mudança (getter) para refletir o form */
  get noites(): number {
    const ini = this.form.value.dataInicio;
    const fim = this.form.value.dataFim;
    if (!ini || !fim) return 0;
    const d1 = new Date(ini + 'T12:00:00');
    const d2 = new Date(fim + 'T12:00:00');
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  /** Taxa por criança (acima de 5 anos) */
  taxaCriancaPorNoite = 50;
  /** Taxa por pet por noite */
  taxaPetPorNoite = 80;

  /** Quantidade de crianças que pagam taxa (5+ anos). Inclui form.criancas e hóspedes tipo Criança com idade >= 5 */
  get criancasComTaxa(): number {
    const criancasForm = this.form.value.criancas ?? 0;
    const guests = (this.form.get('guests') as FormArray)?.controls ?? [];
    let dosGuests = 0;
    for (const g of guests) {
      const tipo = g.get('tipo')?.value;
      const dataNasc = g.get('dataNascimento')?.value;
      if (tipo === 'Criança' && dataNasc) {
        const idade = this.getIdadeFromDataNascimento(dataNasc);
        if (idade !== null && idade >= 5) dosGuests++;
      }
    }
    return criancasForm + dosGuests;
  }

  /** Idade em anos a partir da data de nascimento (string YYYY-MM-DD) */
  getIdadeFromDataNascimento(dataNascimento: string): number | null {
    if (!dataNascimento) return null;
    const nasc = new Date(dataNascimento + 'T12:00:00');
    if (isNaN(nasc.getTime())) return null;
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade >= 0 ? idade : null;
  }

  get precoTotal(): number {
    const r = this.room();
    const spa = this.spaAddOn();
    const n = this.noites;
    const hospedagem = r ? n * Number(r.precoDiaria) : 0;
    const spaValor = spa ? spa.preco : 0;
    const criancasTaxa = this.criancasComTaxa;
    const pets = this.form.value.pets || 0;
    const taxaCriancas = criancasTaxa > 0 ? n * criancasTaxa * this.taxaCriancaPorNoite : 0;
    const taxaPets = pets > 0 ? n * pets * this.taxaPetPorNoite : 0;
    return hospedagem + spaValor + taxaCriancas + taxaPets;
  }

  get totalHospedes(): number {
    const adultos = this.form.value.adultos || 1;
    const criancas = this.form.value.criancas || 0;
    const guestsCount = (this.form.get('guests') as FormArray)?.length ?? 0;
    return adultos + criancas + guestsCount;
  }

  guestsArray = computed(() => this.form.get('guests') as FormArray);

  addGuest() {
    const guestForm = this.fb.group({
      nome: ['', Validators.required],
      cpf: [''],
      dataNascimento: [''],
      nacionalidade: [''],
      telefone: [''],
      tipo: ['Adulto', Validators.required],
      idade: [null as number | null]
    });
    (this.form.get('guests') as FormArray).push(guestForm);
  }

  removeGuest(index: number) {
    (this.form.get('guests') as FormArray).removeAt(index);
  }

  ngOnInit() {
    const id = this.roomId();
    if (!id) {
      this.router.navigate(['/quartos']);
      return;
    }
    const spaId = this.route.snapshot.queryParamMap.get('spa');
    if (spaId) {
      const addOn = getSpaAddOn(spaId);
      if (addOn) this.spaAddOn.set(addOn);
    }
    this.api.getRoom(id).subscribe({
      next: (r) => {
        this.room.set(r);
        const sp = this.search.getParams();
        if (sp.dataInicio && sp.dataFim) {
          this.form.patchValue({ dataInicio: sp.dataInicio, dataFim: sp.dataFim });
        }
      },
      error: () => this.router.navigate(['/quartos']),
      complete: () => this.loading.set(false)
    });
  }

  avancarParaHospede() {
    if (this.form.invalid || !this.room()) return;
    const ini = new Date(this.form.value.dataInicio!);
    const fim = new Date(this.form.value.dataFim!);
    if (fim <= ini) {
      this.error.set('A data de check-out deve ser posterior ao check-in.');
      return;
    }
    this.error.set('');
    this.step.set(2);
  }

  avancarParaRevisao() {
    this.step.set(3);
  }

  voltarParaDatas() {
    this.step.set(1);
  }

  voltarParaHospede() {
    this.step.set(2);
  }

  confirmarReserva() {
    if (!this.room()) return;
    this.error.set('');
    this.submitting.set(true);
    
    const guests = this.guestsArray().value.map((g: any) => ({
      nome: g.nome,
      cpf: g.cpf || undefined,
      dataNascimento: g.dataNascimento || undefined,
      nacionalidade: g.nacionalidade || undefined,
      telefone: g.telefone || undefined,
      tipo: g.tipo,
      idade: g.idade || undefined
    }));

    const body: any = {
      roomId: this.room()!.id,
      dataInicio: this.form.value.dataInicio!,
      dataFim: this.form.value.dataFim!,
      adultos: this.form.value.adultos || 1,
      criancas: this.form.value.criancas || 0,
      pets: this.form.value.pets || 0,
      observacoes: this.form.value.observacoes || undefined,
      metodoPagamento: this.form.value.metodoPagamento || undefined,
      tokenPagamento: this.form.value.tokenPagamento || undefined,
      guests: guests.length > 0 ? guests : undefined
    };

    this.api.createReservation(body).subscribe({
      next: (res) => {
        this.reservationId.set(res.id);
        this.step.set(4);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Não foi possível concluir a reserva.');
        this.submitting.set(false);
      },
      complete: () => this.submitting.set(false)
    });
  }

  formatarData(s: string): string {
    return new Date(s).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}
