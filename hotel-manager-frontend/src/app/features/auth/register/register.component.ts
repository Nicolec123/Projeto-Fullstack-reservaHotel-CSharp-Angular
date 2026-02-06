import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const senha = control.get('senha');
  const confirmarSenha = control.get('confirmarSenha');
  if (!senha || !confirmarSenha) return null;
  return senha.value === confirmarSenha.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  error = '';
  loading = false;
  currentStep = signal(1); // 1 = Dados essenciais, 2 = Documento, 3 = Endereço/Contato/Dependentes, 4 = Preferências
  dependents = signal<Array<{ nome: string; dataNascimento: string; cpf: string; nivelDependente: string; observacoes: string }>>([]);

  form = this.fb.nonNullable.group({
    // Dados essenciais
    nome: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', [Validators.required]],
    telefone: [''],
    
    // Dados comuns em hotéis
    cpf: [''],
    dataNascimento: [''],
    nacionalidade: [''],
    
    // Dados opcionais (mantidos para compatibilidade)
    endereco: [''],
    cidade: [''],
    pais: [''],
    idiomaPreferido: [''],
    
    // Endereço completo
    enderecoCompleto: this.fb.group({
      rua: [''],
      numero: [''],
      complemento: [''],
      bairro: [''],
      cidade: [''],
      estado: [''],
      cep: [''],
      pais: ['']
    }),
    
    // Contato de emergência
    contatoEmergencia: this.fb.group({
      nome: [''],
      telefone: [''],
      email: [''],
      relacao: ['']
    }),
    
    // Preferências de estadia
    tipoCamaPreferido: [''],
    andarAlto: [false],
    quartoSilencioso: [false],
    naoFumante: [false],
    acessibilidade: [false],
    preferenciaAlimentar: ['']
  }, { validators: passwordMatchValidator });

  get essentialFields() {
    return this.fb.group({
      nome: this.form.get('nome')!,
      email: this.form.get('email')!,
      senha: this.form.get('senha')!,
      confirmarSenha: this.form.get('confirmarSenha')!,
      telefone: this.form.get('telefone')!
    });
  }

  nextStep() {
    if (this.currentStep() === 1) {
      const essential = ['nome', 'email', 'senha', 'confirmarSenha'];
      const invalid = essential.some(field => this.form.get(field)?.invalid);
      if (invalid) return;
      this.currentStep.set(2);
    } else if (this.currentStep() === 2) {
      this.currentStep.set(3);
    } else if (this.currentStep() === 3) {
      this.currentStep.set(4);
    }
  }

  addDependent() {
    this.dependents.update(deps => [...deps, { nome: '', dataNascimento: '', cpf: '', nivelDependente: '', observacoes: '' }]);
  }

  removeDependent(index: number) {
    this.dependents.update(deps => deps.filter((_, i) => i !== index));
  }

  updateDependent(index: number, field: string, value: string) {
    this.dependents.update(deps => {
      const updated = [...deps];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.error = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    if (this.form.get('senha')?.value !== this.form.get('confirmarSenha')?.value) {
      this.error = 'As senhas não coincidem.';
      return;
    }

    this.error = '';
    this.loading = true;
    
    const formValue = this.form.getRawValue();
    const payload: any = {
      nome: formValue.nome,
      email: formValue.email,
      senha: formValue.senha,
      confirmarSenha: formValue.confirmarSenha,
      telefone: formValue.telefone || undefined,
      cpf: formValue.cpf || undefined,
      dataNascimento: formValue.dataNascimento || undefined,
      nacionalidade: formValue.nacionalidade || undefined,
      endereco: formValue.endereco || undefined,
      cidade: formValue.cidade || undefined,
      pais: formValue.pais || undefined,
      idiomaPreferido: formValue.idiomaPreferido || undefined,
      tipoCamaPreferido: formValue.tipoCamaPreferido || undefined,
      andarAlto: formValue.andarAlto || undefined,
      quartoSilencioso: formValue.quartoSilencioso || undefined,
      naoFumante: formValue.naoFumante || undefined,
      acessibilidade: formValue.acessibilidade || undefined,
      preferenciaAlimentar: formValue.preferenciaAlimentar || undefined
    };

    // Adicionar endereço completo se preenchido
    const enderecoCompleto = formValue.enderecoCompleto;
    if (enderecoCompleto && (enderecoCompleto.rua || enderecoCompleto.bairro || enderecoCompleto.cidade)) {
      payload.enderecoCompleto = {
        rua: enderecoCompleto.rua || '',
        numero: enderecoCompleto.numero || undefined,
        complemento: enderecoCompleto.complemento || undefined,
        bairro: enderecoCompleto.bairro || '',
        cidade: enderecoCompleto.cidade || '',
        estado: enderecoCompleto.estado || '',
        cep: enderecoCompleto.cep || '',
        pais: enderecoCompleto.pais || ''
      };
    }

    // Adicionar contato de emergência se preenchido
    const contatoEmergencia = formValue.contatoEmergencia;
    if (contatoEmergencia && (contatoEmergencia.nome || contatoEmergencia.telefone)) {
      payload.contatoEmergencia = {
        nome: contatoEmergencia.nome || '',
        telefone: contatoEmergencia.telefone || '',
        email: contatoEmergencia.email || undefined,
        relacao: contatoEmergencia.relacao || undefined
      };
    }

    // Adicionar dependentes se houver
    const dependents = this.dependents();
    if (dependents.length > 0) {
      payload.dependentes = dependents
        .filter(dep => dep.nome && dep.nivelDependente)
        .map(dep => ({
          nome: dep.nome,
          dataNascimento: dep.dataNascimento || undefined,
          cpf: dep.cpf || undefined,
          nivelDependente: dep.nivelDependente,
          observacoes: dep.observacoes || undefined
        }));
    }

    // Remove campos vazios
    Object.keys(payload).forEach(key => {
      if (payload[key] === '' || payload[key] === null || payload[key] === undefined) {
        delete payload[key];
      }
    });

    this.auth.register(payload).subscribe({
      next: () => this.router.navigate(['/quartos']),
      error: (err) => {
        this.error = err.error?.message || 'Não foi possível cadastrar.';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}
