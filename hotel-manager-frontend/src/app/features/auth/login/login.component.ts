import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  error = '';
  loading = false;

  /** Login vindo do Admin: não fala de reservas, não mostra link de cadastro */
  isAdminLogin = computed(() => {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
    return returnUrl.includes('/admin');
  });

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
    lembrarDeMim: [false]
  });

  submit() {
    if (this.form.invalid) return;
    this.error = '';
    this.loading = true;
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/quartos';
    const isAdmin = this.isAdminLogin();
    const body = {
      email: this.form.getRawValue().email,
      senha: this.form.getRawValue().senha,
      lembrarDeMim: isAdmin ? false : this.form.getRawValue().lembrarDeMim
    };
    this.auth.login(body, isAdmin).subscribe({
      next: () => {
        const user = this.auth.currentUser();
        if (user && ['Admin', 'Gerente', 'Recepcionista'].includes(user.role)) {
          this.router.navigateByUrl('/admin');
        } else {
          this.router.navigateByUrl(returnUrl);
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Email ou senha inválidos.';
        this.loading = false;
      },
      complete: () => (this.loading = false)
    });
  }
}
