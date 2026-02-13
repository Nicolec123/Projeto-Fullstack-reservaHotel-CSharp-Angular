import { Component, inject, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ReservationStateService } from '../../../core/services/reservation-state.service';
import { SPA_BOOKING_PACKAGES, SpaBookingPackage, calculateSpaPackagePrice } from '../../../core/constants/spa-booking-packages';

@Component({
  selector: 'app-spa-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './spa-booking.component.html',
  styleUrl: './spa-booking.component.css'
})
export class SpaBookingComponent {
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);
  private readonly reservationState = inject(ReservationStateService);

  /** Quando true, exibido dentro do painel admin (link "Voltar" vai para o painel) */
  isAdminContext = input<boolean>(false);

  readonly packages = SPA_BOOKING_PACKAGES;
  selectedPackage = signal<SpaBookingPackage | null>(null);
  
  /** 1 = Escolher pacote | 2 = Dados e horário | 3 = Revisão/Pagamento | 4 = Sucesso */
  step = signal(1);
  loading = signal(false);
  submitting = signal(false);
  error = signal('');

  // Para pacote individual: 'eu' ou 'outro'
  individualPara = signal<'eu' | 'outro'>('eu');

  form = this.fb.nonNullable.group({
    packageId: ['', Validators.required],
    dataAgendamento: ['', Validators.required],
    horario: ['', Validators.required],
    numPessoas: [1, [Validators.required, Validators.min(1)]],
    // Dados da primeira pessoa (quem está fazendo o agendamento)
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefone: ['', Validators.required],
    // Dados das outras pessoas (casal/família)
    outrasPessoas: this.fb.array<FormGroup>([]),
    observacoes: [''],
    metodoPagamento: [''],
    tokenPagamento: ['']
  });

  get outrasPessoasArray(): FormArray {
    return this.form.get('outrasPessoas') as FormArray;
  }

  numPessoas = computed(() => {
    const pkg = this.selectedPackageData();
    if (!pkg) return 1;
    
    if (pkg.tipo === 'casal') {
      return 2; // Sempre 2 para casal
    }
    
    if (pkg.tipo === 'familia') {
      return this.form.value.numPessoas || pkg.pessoasIncluidas;
    }
    
    // Individual: sempre 1
    return 1;
  });

  selectedPackageData = computed(() => {
    const pkgId = this.form.value.packageId;
    return pkgId ? this.packages.find(p => p.id === pkgId) : null;
  });

  precoTotal = computed(() => {
    const pkgId = this.form.value.packageId;
    const pessoas = this.numPessoas();
    if (!pkgId) return 0;
    return calculateSpaPackagePrice(pkgId, pessoas);
  });

  horariosDisponiveis = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00'
  ];

  ngOnInit() {
    // Verificar se há estado pendente para restaurar
    const pendingState = this.reservationState.getPendingState();
    if (pendingState && this.auth.isLoggedIn() && !this.auth.isAdmin()) {
      // Restaurar query params do estado pendente
      if (pendingState.queryParams) {
        const packageId = pendingState.queryParams['pacote'];
        if (packageId) {
          const pkg = this.packages.find(p => p.id === packageId);
          if (pkg) {
            // Limpar estado pendente antes de selecionar pacote
            this.reservationState.clearPendingState();
            this.selectPackage(pkg);
            return;
          }
        }
      }
    }

    const packageId = this.route.snapshot.queryParamMap.get('pacote');
    if (packageId) {
      const pkg = this.packages.find(p => p.id === packageId);
      if (pkg) {
        this.selectPackage(pkg);
      }
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

  onIndividualParaChange(value: 'eu' | 'outro') {
    this.individualPara.set(value);
    this.outrasPessoasArray.clear();
    if (value === 'outro') {
      this.adicionarPessoa();
    }
  }

  getPessoaGroup(index: number): FormGroup {
    return this.outrasPessoasArray.at(index) as FormGroup;
  }

  getPessoaValue(index: number, field: string): string {
    const group = this.outrasPessoasArray.at(index) as FormGroup;
    return group?.get(field)?.value || '';
  }

  selectPackage(pkg: SpaBookingPackage) {
    // Verificar se o usuário está logado antes de continuar
    if (!this.auth.isLoggedIn() || this.auth.isAdmin()) {
      // Salvar estado atual antes de redirecionar
      const currentUrl = '/spa/agendar'; // URL fixa do spa booking
      const queryParams: Record<string, string> = {
        pacote: pkg.id
      };
      
      // Salvar estado pendente
      this.reservationState.savePendingState(currentUrl, queryParams);
      
      // Redirecionar para login
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: `${currentUrl}?pacote=${pkg.id}` } 
      });
      return;
    }

    this.selectedPackage.set(pkg);
    this.form.patchValue({
      packageId: pkg.id,
      numPessoas: pkg.pessoasIncluidas
    });
    
    // Limpar e configurar array de outras pessoas baseado no tipo
    this.outrasPessoasArray.clear();
    
    if (pkg.tipo === 'casal') {
      // Casal: sempre precisa de dados da segunda pessoa
      this.adicionarPessoa();
    } else if (pkg.tipo === 'familia') {
      // Família: começa com pessoasIncluidas - 1 (a primeira já está no form principal)
      const pessoasExtras = pkg.pessoasIncluidas - 1;
      for (let i = 0; i < pessoasExtras; i++) {
        this.adicionarPessoa();
      }
    }
    // Individual: não adiciona outras pessoas ainda (só se escolher "outro")
    
    this.step.set(2);
    this.error.set('');
  }

  adicionarPessoa() {
    const pessoaGroup = this.fb.nonNullable.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', Validators.required]
    });
    this.outrasPessoasArray.push(pessoaGroup);
  }

  removerPessoa(index: number) {
    this.outrasPessoasArray.removeAt(index);
    // Atualizar numPessoas para família
    const pkg = this.selectedPackageData();
    if (pkg?.tipo === 'familia') {
      this.form.patchValue({
        numPessoas: this.outrasPessoasArray.length + 1
      });
    }
  }

  adicionarPessoaFamilia() {
    const pkg = this.selectedPackageData();
    if (!pkg || pkg.tipo !== 'familia') return;
    
    if (pkg.pessoasMaximas && this.numPessoas() >= pkg.pessoasMaximas) {
      this.error.set(`Este pacote permite no máximo ${pkg.pessoasMaximas} pessoas.`);
      return;
    }
    
    this.adicionarPessoa();
    this.form.patchValue({
      numPessoas: this.outrasPessoasArray.length + 1
    });
    this.error.set('');
  }

  voltarParaPacotes() {
    this.step.set(1);
    this.selectedPackage.set(null);
  }

  avancarParaRevisao() {
    // Marcar todos os campos como touched para mostrar erros
    this.form.markAllAsTouched();
    
    // Validar campos principais
    if (this.form.get('nome')?.invalid || 
        this.form.get('email')?.invalid || 
        this.form.get('telefone')?.invalid ||
        !this.form.get('dataAgendamento')?.value ||
        !this.form.get('horario')?.value) {
      this.error.set('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const pkg = this.selectedPackageData();
    if (!pkg) {
      this.error.set('Selecione um pacote.');
      return;
    }

    // Validar outras pessoas baseado no tipo
    if (pkg.tipo === 'casal') {
      // Casal: deve ter exatamente 1 pessoa extra
      if (this.outrasPessoasArray.length !== 1) {
        this.error.set('Por favor, preencha os dados da segunda pessoa.');
        return;
      }
      const pessoa2 = this.outrasPessoasArray.at(0);
      if (pessoa2?.invalid) {
        this.error.set('Por favor, preencha todos os dados da segunda pessoa.');
        return;
      }
    } else if (pkg.tipo === 'familia') {
      // Família: validar todas as pessoas extras
      if (this.outrasPessoasArray.length < pkg.pessoasIncluidas - 1) {
        this.error.set(`Por favor, preencha os dados de todas as ${pkg.pessoasIncluidas} pessoas.`);
        return;
      }
      for (let i = 0; i < this.outrasPessoasArray.length; i++) {
        if (this.outrasPessoasArray.at(i)?.invalid) {
          this.error.set(`Por favor, preencha todos os dados da pessoa ${i + 2}.`);
          return;
        }
      }
    } else if (pkg.tipo === 'individual') {
      // Individual: se escolheu "outro", deve ter dados da outra pessoa
      if (this.individualPara() === 'outro') {
        if (this.outrasPessoasArray.length !== 1) {
          this.error.set('Por favor, preencha os dados da pessoa que utilizará o serviço.');
          return;
        }
        const pessoa = this.outrasPessoasArray.at(0);
        if (pessoa?.invalid) {
          this.error.set('Por favor, preencha todos os dados da pessoa que utilizará o serviço.');
          return;
        }
      }
    }

    const numPessoas = this.numPessoas();
    if (pkg.pessoasMaximas && numPessoas > pkg.pessoasMaximas) {
      this.error.set(`Este pacote permite no máximo ${pkg.pessoasMaximas} pessoas.`);
      return;
    }

    if (numPessoas < pkg.pessoasIncluidas) {
      this.error.set(`Este pacote requer no mínimo ${pkg.pessoasIncluidas} pessoa(s).`);
      return;
    }

    // Validar data e horário
    const dataAgendamento = this.form.value.dataAgendamento;
    if (dataAgendamento) {
      const data = new Date(dataAgendamento + 'T12:00:00');
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      if (data < hoje) {
        this.error.set('A data de agendamento deve ser futura.');
        return;
      }
    }

    this.error.set('');
    this.step.set(3);
  }

  voltarParaDados() {
    this.step.set(2);
  }

  confirmarAgendamento() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (this.form.invalid) {
      this.error.set('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    this.submitting.set(true);
    this.error.set('');

    // Por enquanto, vamos simular o agendamento
    // Em produção, isso chamaria a API
    setTimeout(() => {
      this.submitting.set(false);
      this.step.set(4);
    }, 1500);
  }

  formatarData(s: string): string {
    if (!s) return '';
    return new Date(s + 'T12:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
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
    futuro.setMonth(futuro.getMonth() + 3);
    return futuro.toISOString().split('T')[0];
  }
}
