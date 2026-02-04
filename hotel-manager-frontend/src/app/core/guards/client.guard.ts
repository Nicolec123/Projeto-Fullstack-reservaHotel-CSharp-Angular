import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Só clientes (não-admin) podem reservar. Admin é redirecionado. */
export const clientGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdmin()) {
    router.navigate(['/quartos']);
    return false;
  }
  return true;
};
