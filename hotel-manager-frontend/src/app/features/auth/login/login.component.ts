import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ReservationStateService } from '../../../core/services/reservation-state.service';

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
  private readonly reservationState = inject(ReservationStateService);

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
    
    // Verificar se há estado pendente de reserva
    const pendingState = this.reservationState.getPendingState();
    const returnUrlFromQuery = this.route.snapshot.queryParams['returnUrl'];
    
    // Priorizar estado pendente se existir, senão usar returnUrl da query
    let returnUrl = pendingState?.url || returnUrlFromQuery || '/quartos';
    let queryParams = pendingState?.queryParams;
    
    // Se não houver estado pendente mas o returnUrl contém query params, extrair
    if (!queryParams && returnUrlFromQuery && returnUrlFromQuery.includes('?')) {
      const [url, queryString] = returnUrlFromQuery.split('?');
      returnUrl = url;
      queryParams = {};
      queryString.split('&').forEach((param: string) => {
        const [key, value] = param.split('=');
        if (key && value) {
          queryParams![key] = decodeURIComponent(value);
        }
      });
    }
    
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
          // Limpar estado pendente se for admin
          this.reservationState.clearPendingState();
          this.router.navigateByUrl('/admin');
        } else {
          // Limpar estado pendente após redirecionar
          this.reservationState.clearPendingState();
          // Navegar com query params se houver
          if (queryParams && Object.keys(queryParams).length > 0) {
            this.router.navigate([returnUrl], { queryParams });
          } else {
            this.router.navigateByUrl(returnUrl);
          }
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
