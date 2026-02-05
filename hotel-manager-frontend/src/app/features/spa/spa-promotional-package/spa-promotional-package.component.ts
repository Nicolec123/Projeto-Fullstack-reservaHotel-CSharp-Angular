import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { SPA_PACKAGES, getSpaPackage, SpaPackage } from '../../../core/constants/spa-packages';

@Component({
  selector: 'app-spa-promotional-package',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './spa-promotional-package.component.html',
  styleUrl: './spa-promotional-package.component.css'
})
export class SpaPromotionalPackageComponent implements OnInit {
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  packageId = signal<string | null>(null);
  packageData = signal<SpaPackage | null>(null);
  
  /** 1 = Detalhes | 2 = Customização | 3 = Dados | 4 = Revisão/Pagamento | 5 = Sucesso */
  step = signal(1);
  loading = signal(false);
  submitting = signal(false);
  error = signal('');

  /** Snapshot dos dados do formulário ao entrar na revisão (garante exibir o que foi preenchido) */
  reviewSnapshot = signal<Record<string, unknown> | null>(null);

  // Computed para verificar se método de pagamento está selecionado
  metodoPagamentoSelecionado = computed(() => {
    return !!this.form.get('metodoPagamento')?.value;
  });

  constructor() {
    // Garantir que snapshot seja capturado sempre que entrar no passo 4
    effect(() => {
      const currentStep = this.step();
      if (currentStep === 4) {
        // Capturar snapshot se ainda não existe (não sobrescrever se já existe)
        const snap = this.reviewSnapshot();
        if (!snap || Object.keys(snap).length === 0) {
          this.capturarSnapshot();
        }
      }
    });
  }

  /** Captura snapshot do formulário para exibir na revisão */
  capturarSnapshot() {
    this.form.updateValueAndValidity();
    const rawValue = this.form.getRawValue();
    const snapshot = JSON.parse(JSON.stringify(rawValue));
    this.reviewSnapshot.set(snapshot);
  }

  form = this.fb.nonNullable.group({
    dataCheckIn: ['', Validators.required],
    dataCheckOut: ['', Validators.required],
    numHospedes: [1, [Validators.required, Validators.min(1)]],
    tipoAcomodacao: ['solteiro', Validators.required], // 'solteiro', 'casal' ou 'duas-camas'
    numCriancas: [0, [Validators.min(0)]],
    numCaes: [0, [Validators.min(0)]],
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefone: ['', Validators.required],
    hospedesExtras: this.fb.array<FormGroup>([]),
    observacoes: [''],
    metodoPagamento: [''],
  });

  // Taxa por cão por noite
  readonly taxaPorCaoPorNoite = 50;

  get hospedesExtrasArray(): FormArray {
    return this.form.get('hospedesExtras') as FormArray;
  }

  numHospedesTotal = computed(() => {
    return (this.form.value.numHospedes || 1) + this.hospedesExtrasArray.length;
  });

  precoTotal = computed(() => {
    const pkg = this.packageData();
    if (!pkg) return 0;
    
    const pessoasIncluidas = pkg.pessoasIncluidas || 1;
    const numHospedes = this.numHospedesTotal();
    let total = pkg.precoBase;
    
    // Se tem mais pessoas que o incluído, cobra extra
    if (numHospedes > pessoasIncluidas && pkg.precoPorPessoaExtra) {
      const pessoasExtras = numHospedes - pessoasIncluidas;
      total += pessoasExtras * pkg.precoPorPessoaExtra;
    }
    
    // Taxa de cães
    if (this.form.value.numCaes) {
      const numCaes = this.form.value.numCaes || 0;
      const numNoites = pkg.noites || 1;
      total += numCaes * this.taxaPorCaoPorNoite * numNoites;
    }
    
    return total;
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.packageId.set(id);
      const pkg = getSpaPackage(id);
      if (pkg) {
        this.packageData.set(pkg);
        // Preencher número padrão de pessoas
        this.form.patchValue({
          numHospedes: pkg.pessoasIncluidas || 1
        });
      } else {
        this.error.set('Pacote não encontrado.');
        setTimeout(() => this.router.navigate(['/']), 2000);
      }
    } else {
      this.router.navigate(['/']);
    }

    // Preencher dados do usuário logado
    if (this.auth.isLoggedIn()) {
      const user = this.auth.currentUser();
      if (user) {
        this.form.patchValue({
          nome: user.nome,
          email: user.email || ''
        });
      }
    }
  }

  avancarParaCustomizacao() {
    this.step.set(2);
    this.error.set('');
  }

  voltarParaDetalhes() {
    this.step.set(1);
  }

  avancarParaDados() {
    // Validar datas
    const checkIn = this.form.value.dataCheckIn;
    
    if (!checkIn) {
      this.error.set('Por favor, selecione a data de check-in.');
      return;
    }

    // Calcular check-out automaticamente se ainda não foi calculado
    let checkOut = this.form.value.dataCheckOut;
    if (!checkOut) {
      checkOut = this.calcularDataCheckOut();
      if (checkOut) {
        this.form.patchValue({ dataCheckOut: checkOut });
      }
    }

    if (!checkOut) {
      this.error.set('Não foi possível calcular a data de check-out. Por favor, selecione novamente a data de check-in.');
      return;
    }

    const dataIn = new Date(checkIn + 'T12:00:00');
    const dataOut = new Date(checkOut + 'T12:00:00');
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataIn < hoje) {
      this.error.set('A data de check-in deve ser futura.');
      return;
    }

    // Configurar array de hóspedes extras baseado no número de pessoas
    const pkg = this.packageData();
    const numHospedes = this.form.value.numHospedes || 1;
    const pessoasIncluidas = pkg?.pessoasIncluidas || 1;
    const pessoasExtras = numHospedes - pessoasIncluidas;

    // Limpar e recriar array de hóspedes extras
    this.hospedesExtrasArray.clear();
    for (let i = 0; i < pessoasExtras; i++) {
      this.adicionarHospedeExtra();
    }

    this.error.set('');
    this.step.set(3);
  }

  adicionarHospedeExtra() {
    const hospedeGroup = this.fb.nonNullable.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', Validators.required]
    });
    this.hospedesExtrasArray.push(hospedeGroup);
  }

  removerHospedeExtra(index: number) {
    this.hospedesExtrasArray.removeAt(index);
    // Atualizar número de hóspedes
    const pkg = this.packageData();
    const pessoasIncluidas = pkg?.pessoasIncluidas || 1;
    this.form.patchValue({
      numHospedes: pessoasIncluidas + this.hospedesExtrasArray.length
    });
  }

  getHospedeGroup(index: number): FormGroup {
    return this.hospedesExtrasArray.at(index) as FormGroup;
  }

  getHospedeValue(index: number, field: string): string {
    const group = this.hospedesExtrasArray.at(index) as FormGroup;
    return group?.get(field)?.value || '';
  }

  decrementarHospedes() {
    const pkg = this.packageData();
    const min = pkg?.pessoasIncluidas || 1;
    const atual = this.form.value.numHospedes || min;
    const novo = Math.max(min, atual - 1);
    this.form.patchValue({ numHospedes: novo });
    this.onNumHospedesChange();
  }

  incrementarHospedes() {
    const pkg = this.packageData();
    const max = pkg?.pessoasMaximas || 4;
    const atual = this.form.value.numHospedes || 1;
    const novo = Math.min(max, atual + 1);
    this.form.patchValue({ numHospedes: novo });
    this.onNumHospedesChange();
  }

  onNumHospedesChange() {
    const numHospedes = this.form.value.numHospedes || 1;
    const pkg = this.packageData();
    const pessoasIncluidas = pkg?.pessoasIncluidas || 1;
    
    if (pkg?.pessoasMaximas && numHospedes > pkg.pessoasMaximas) {
      this.error.set(`Este pacote permite no máximo ${pkg.pessoasMaximas} pessoa(s).`);
      this.form.patchValue({ numHospedes: pkg.pessoasMaximas });
      return;
    }

    if (numHospedes < pessoasIncluidas) {
      this.error.set(`Este pacote requer no mínimo ${pessoasIncluidas} pessoa(s).`);
      this.form.patchValue({ numHospedes: pessoasIncluidas });
      return;
    }

    // Atualizar tipo de acomodação baseado no número de pessoas
    if (numHospedes === 1) {
      this.form.patchValue({ tipoAcomodacao: 'solteiro' });
    } else if (numHospedes >= 2 && this.form.value.tipoAcomodacao === 'solteiro') {
      // Se mudou de 1 para 2+, mas estava em solteiro, muda para casal
      this.form.patchValue({ tipoAcomodacao: 'casal' });
    }

    // Se estamos na etapa 2 (customização), atualizar array de hóspedes extras
    if (this.step() === 2) {
      const pessoasExtras = numHospedes - pessoasIncluidas;
      const diff = pessoasExtras - this.hospedesExtrasArray.length;
      
      if (diff > 0) {
        // Adicionar hóspedes extras
        for (let i = 0; i < diff; i++) {
          this.adicionarHospedeExtra();
        }
      } else if (diff < 0) {
        // Remover hóspedes extras
        for (let i = 0; i < Math.abs(diff); i++) {
          this.hospedesExtrasArray.removeAt(this.hospedesExtrasArray.length - 1);
        }
      }
    }

    this.error.set('');
  }

  voltarParaCustomizacao() {
    this.step.set(2);
  }

  avancarParaRevisao() {
    this.form.markAllAsTouched();
    
    // Validar dados principais
    if (this.form.get('nome')?.invalid || 
        this.form.get('email')?.invalid || 
        this.form.get('telefone')?.invalid) {
      this.error.set('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validar hóspedes extras
    const numHospedes = this.form.value.numHospedes || 1;
    const pkg = this.packageData();
    const pessoasIncluidas = pkg?.pessoasIncluidas || 1;
    const pessoasExtras = numHospedes - pessoasIncluidas;

    if (pessoasExtras > 0) {
      if (this.hospedesExtrasArray.length !== pessoasExtras) {
        this.error.set('Por favor, preencha os dados de todas as pessoas extras.');
        return;
      }

      for (let i = 0; i < this.hospedesExtrasArray.length; i++) {
        const hospedeGroup = this.hospedesExtrasArray.at(i) as FormGroup;
        if (hospedeGroup.invalid) {
          this.error.set(`Por favor, preencha todos os dados da pessoa ${i + pessoasIncluidas + 1}.`);
          return;
        }
      }
    }

    this.error.set('');
    // Capturar snapshot ANTES de mudar para o passo 4 (garante dados aparecem imediatamente)
    this.capturarSnapshot();
    this.step.set(4);
  }

  voltarParaDados() {
    this.step.set(3);
  }

  confirmarReserva() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (this.form.invalid || !this.form.value.metodoPagamento) {
      this.error.set('Por favor, preencha todos os campos obrigatórios e selecione o método de pagamento.');
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    // Por enquanto, vamos simular a reserva
    // Em produção, isso chamaria a API
    setTimeout(() => {
      this.submitting.set(false);
      this.step.set(5);
    }, 1500);
  }

  formatarData(s: string | null | undefined): string {
    if (!s) return '';
    return new Date(s + 'T12:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatarDataOuNaoInformado(controlName: string): string {
    const value = this.form.get(controlName)?.value;
    return value ? this.formatarData(value) : 'Não informado';
  }

  /** Valores da revisão a partir do snapshot (usar no passo 4) */
  getReviewValue(key: string): string | number | undefined {
    const snap = this.reviewSnapshot();
    // Se snapshot existe, usar ele; senão, usar formulário diretamente (fallback)
    if (snap && (key in snap)) {
      return snap[key] as string | number | undefined;
    }
    // Fallback: ler diretamente do formulário
    const formValue = this.form.get(key)?.value;
    return formValue !== null && formValue !== undefined ? formValue : undefined;
  }

  /** Retorna valor numérico do snapshot (garante tipo number) */
  getReviewValueAsNumber(key: string): number {
    const value = this.getReviewValue(key);
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  getReviewDataFormatada(key: string): string {
    const v = this.getReviewValue(key);
    return v ? this.formatarData(String(v)) : 'Não informado';
  }

  getReviewHospedeExtra(index: number, field: string): string {
    const snap = this.reviewSnapshot();
    const arr = snap?.['hospedesExtras'] as Array<Record<string, string>> | undefined;
    if (!arr || !arr[index]) return 'Não informado';
    return arr[index][field] ?? 'Não informado';
  }

  getReviewHospedesExtras(): Array<Record<string, string>> {
    const snap = this.reviewSnapshot();
    if (snap && snap['hospedesExtras']) {
      const arr = snap['hospedesExtras'] as Array<Record<string, string>> | undefined;
      if (Array.isArray(arr)) return arr;
    }
    // Fallback: ler do formulário
    const formArray = this.hospedesExtrasArray;
    const result: Array<Record<string, string>> = [];
    for (let i = 0; i < formArray.length; i++) {
      const group = formArray.at(i) as FormGroup;
      result.push({
        nome: group.get('nome')?.value || '',
        email: group.get('email')?.value || '',
        telefone: group.get('telefone')?.value || ''
      });
    }
    return result;
  }

  getReviewNumHospedesTotal(): number {
    const snap = this.reviewSnapshot();
    let num = 1;
    if (snap && snap['numHospedes']) {
      num = (snap['numHospedes'] as number) ?? 1;
    } else {
      // Fallback: ler do formulário
      num = this.form.get('numHospedes')?.value ?? 1;
    }
    const extras = this.getReviewHospedesExtras();
    return num + extras.length;
  }

  getReviewPrecoTotal(): number {
    const pkg = this.packageData();
    if (!pkg) return 0;
    const pessoasIncluidas = pkg.pessoasIncluidas || 1;
    const numHospedes = this.getReviewNumHospedesTotal();
    let total = pkg.precoBase;
    if (numHospedes > pessoasIncluidas && pkg.precoPorPessoaExtra) {
      total += (numHospedes - pessoasIncluidas) * pkg.precoPorPessoaExtra;
    }
    const numCaes = this.getReviewValueAsNumber('numCaes');
    if (numCaes > 0 && pkg.noites) {
      total += numCaes * this.taxaPorCaoPorNoite * pkg.noites;
    }
    return total;
  }

  formatarPreco(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  getMinDate(): string {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  }

  getMaxDate(): string {
    const futuro = new Date();
    futuro.setMonth(futuro.getMonth() + 6);
    return futuro.toISOString().split('T')[0];
  }

  calcularDataCheckOut(): string {
    const checkIn = this.form.value.dataCheckIn;
    if (!checkIn) return '';
    
    const pkg = this.packageData();
    if (!pkg || !pkg.noites) return '';

    const dataIn = new Date(checkIn + 'T12:00:00');
    dataIn.setDate(dataIn.getDate() + pkg.noites);
    return dataIn.toISOString().split('T')[0];
  }

  onCheckInChange() {
    const checkIn = this.form.value.dataCheckIn;
    if (!checkIn) {
      this.form.patchValue({ dataCheckOut: '' });
      return;
    }

    const checkOut = this.calcularDataCheckOut();
    if (checkOut) {
      this.form.patchValue({ dataCheckOut: checkOut });
    }
  }


  decrementarCriancas() {
    const atual = this.form.value.numCriancas || 0;
    this.form.patchValue({ numCriancas: Math.max(0, atual - 1) });
  }

  incrementarCriancas() {
    const atual = this.form.value.numCriancas || 0;
    this.form.patchValue({ numCriancas: Math.min(4, atual + 1) });
  }

  decrementarCaes() {
    const atual = this.form.value.numCaes || 0;
    this.form.patchValue({ numCaes: Math.max(0, atual - 1) });
  }

  incrementarCaes() {
    const atual = this.form.value.numCaes || 0;
    this.form.patchValue({ numCaes: Math.min(2, atual + 1) });
  }

  // Métodos auxiliares para acessar valores do formulário na revisão
  getFormValue(controlName: string): any {
    return this.form.get(controlName)?.value ?? '';
  }

  getFormValueAsString(controlName: string): string {
    const value = this.form.get(controlName)?.value;
    return value ? String(value) : '';
  }
}
