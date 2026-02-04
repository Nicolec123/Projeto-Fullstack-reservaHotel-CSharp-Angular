import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../constants/api';

export interface Room {
  id: number;
  numero: string;
  tipo: string;
  precoDiaria: number;
  bloqueado: boolean;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Reservation {
  id: number;
  userId: number;
  roomId: number;
  userNome?: string;
  roomNumero?: string;
  dataInicio: string;
  dataFim: string;
  status: string;
  precoTotal?: number;
}

export interface User {
  id: number;
  nome: string;
  email: string;
  role: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  getRooms(page = 1, pageSize = 10) {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<Room>>(`${API_URL}/rooms`, { params });
  }

  getRoom(id: number) {
    return this.http.get<Room>(`${API_URL}/rooms/${id}`);
  }

  getAvailableRooms(dataInicio: string, dataFim: string) {
    const params = new HttpParams().set('dataInicio', dataInicio).set('dataFim', dataFim);
    return this.http.get<Room[]>(`${API_URL}/rooms/available`, { params });
  }

  createRoom(body: { numero: string; tipo: string; precoDiaria: number }) {
    return this.http.post<Room>(`${API_URL}/rooms`, body);
  }

  updateRoom(id: number, body: { tipo?: string; precoDiaria?: number; bloqueado?: boolean }) {
    return this.http.put<Room>(`${API_URL}/rooms/${id}`, body);
  }

  getMyReservations(page = 1, pageSize = 10) {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<Reservation>>(`${API_URL}/reservations/my`, { params });
  }

  getAllReservations(page = 1, pageSize = 10) {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<Reservation>>(`${API_URL}/reservations/all`, { params });
  }

  getReservation(id: number) {
    return this.http.get<Reservation>(`${API_URL}/reservations/${id}`);
  }

  createReservation(body: { 
    roomId: number; 
    dataInicio: string; 
    dataFim: string; 
    adultos?: number;
    criancas?: number;
    pets?: number;
    observacoes?: string;
    metodoPagamento?: string;
    tokenPagamento?: string;
    guests?: Array<{
      nome: string;
      cpf?: string;
      dataNascimento?: string;
      nacionalidade?: string;
      telefone?: string;
      tipo: string;
      idade?: number;
    }>;
  }) {
    return this.http.post<Reservation>(`${API_URL}/reservations`, body);
  }

  cancelReservation(id: number) {
    return this.http.post<Reservation>(`${API_URL}/reservations/${id}/cancel`, {});
  }

  getUsers(page = 1, pageSize = 10) {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<User>>(`${API_URL}/admin/users`, { params });
  }
}
