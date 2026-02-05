import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Só hóspedes (User) podem reservar. Colaboradores (Admin, Gerente, Recepcionista) são redirecionados. */
export const clientGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isStaff()) {
    router.navigate(['/quartos']);
    return false;
  }
  return true;
};
