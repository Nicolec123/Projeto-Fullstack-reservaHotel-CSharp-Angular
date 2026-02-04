import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL } from '../constants/api';

export interface AuthResponse {
  token: string;
  email: string;
  nome: string;
  role: string;
  userId: number;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  telefone?: string;
  cpf?: string;
  dataNascimento?: string;
  nacionalidade?: string;
  endereco?: string;
  cidade?: string;
  pais?: string;
  idiomaPreferido?: string;
  tipoCamaPreferido?: string;
  andarAlto?: boolean;
  quartoSilencioso?: boolean;
  naoFumante?: boolean;
  acessibilidade?: boolean;
  preferenciaAlimentar?: string;
}

const TOKEN_KEY = 'hotel_token';
const USER_KEY = 'hotel_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private userSignal = signal<AuthResponse | null>(this.loadStoredUser());
  currentUser = this.userSignal.asReadonly();
  isAdmin = computed(() => this.userSignal()?.role === 'Admin');
  isLoggedIn = computed(() => !!this.userSignal()?.token);

  private loadStoredUser(): AuthResponse | null {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    if (!token || !user) return null;
    try {
      return JSON.parse(user) as AuthResponse;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(body: LoginRequest) {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, body).pipe(
      tap((res) => this.setSession(res))
    );
  }

  register(body: RegisterRequest) {
    return this.http.post<AuthResponse>(`${API_URL}/auth/register`, body).pipe(
      tap((res) => this.setSession(res))
    );
  }

  private setSession(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res));
    this.userSignal.set(res);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.userSignal.set(null);
    this.router.navigate(['/login']);
  }
}
