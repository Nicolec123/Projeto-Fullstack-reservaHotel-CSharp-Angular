import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';
import { API_URL } from '../constants/api';

export interface AuthResponse {
  token: string;
  email: string;
  nome: string;
  role: string;
  tipo?: string;
  userId: number;
  expiresAt: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
  lembrarDeMim?: boolean;
}

export interface AddressDto {
  rua: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  pais: string;
}

export interface EmergencyContactDto {
  nome: string;
  telefone: string;
  email?: string;
  relacao?: string;
}

export interface DependentDto {
  nome: string;
  dataNascimento?: string;
  cpf?: string;
  nivelDependente: string;
  observacoes?: string;
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
  enderecoCompleto?: AddressDto;
  contatoEmergencia?: EmergencyContactDto;
  dependentes?: DependentDto[];
}

const TOKEN_KEY = 'hotel_token';
const USER_KEY = 'hotel_user';
const REFRESH_TOKEN_KEY = 'hotel_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private userSignal = signal<AuthResponse | null>(this.loadStoredUser());
  currentUser = this.userSignal.asReadonly();
  isAdmin = computed(() => this.userSignal()?.role === 'Admin');
  /** Colaboradores: Admin, Gerente, Recepcionista - acessam o painel */
  isStaff = computed(() => ['Admin', 'Gerente', 'Recepcionista'].includes(this.userSignal()?.role ?? ''));
  isGerente = computed(() => this.userSignal()?.role === 'Gerente');
  /** Hóspede (User): vê "Minhas reservas", pode reservar */
  isHospede = computed(() => this.userSignal()?.role === 'User');
  /** tipo: guest = hóspede, admin = painel administrativo */
  isGuest = computed(() => this.userSignal()?.tipo === 'guest');
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

  /** Login de hóspede — /api/auth/login. lembrarDeMim = refresh token longo (7–30 dias). */
  loginGuest(body: LoginRequest) {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, body).pipe(
      tap((res) => this.setSession(res))
    );
  }

  /** Login de admin/staff — /api/admin/login. Sessão curta. */
  loginAdmin(body: LoginRequest) {
    return this.http.post<AuthResponse>(`${API_URL}/admin/login`, body).pipe(
      tap((res) => this.setSession(res))
    );
  }

  /** Login unificado — usa guest ou admin conforme returnUrl. */
  login(body: LoginRequest, isAdminLogin: boolean) {
    if (isAdminLogin) {
      return this.loginAdmin(body);
    }
    return this.loginGuest(body);
  }

  register(body: RegisterRequest) {
    return this.http.post<AuthResponse>(`${API_URL}/auth/register`, body).pipe(
      tap((res) => this.setSession(res))
    );
  }

  /** Renovar access token usando refresh token (hóspede com Lembrar de mim). */
  refreshToken() {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refresh) return of(null);
    return this.http.post<AuthResponse>(`${API_URL}/auth/refresh`, { refreshToken: refresh } as { refreshToken: string }).pipe(
      tap((res) => {
        if (res) this.setSession(res);
      }),
      catchError(() => {
        this.clearSession();
        return of(null);
      })
    );
  }

  private setSession(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res));
    if (res.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    this.userSignal.set(res);
  }

  private clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.userSignal.set(null);
  }

  logout() {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refresh) {
      this.http.post(`${API_URL}/auth/logout`, { refreshToken: refresh }).subscribe();
    }
    this.clearSession();
    this.router.navigate(['/login']);
  }
}
