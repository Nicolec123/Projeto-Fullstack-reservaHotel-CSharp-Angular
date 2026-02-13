import { Injectable } from '@angular/core';

export interface PendingReservationState {
  url: string;
  queryParams?: Record<string, string>;
  formData?: Record<string, any>;
  timestamp: number;
}

const PENDING_RESERVATION_KEY = 'hotel_pending_reservation';

@Injectable({ providedIn: 'root' })
export class ReservationStateService {
  /**
   * Salva o estado da reserva pendente quando o usuário não está logado
   */
  savePendingState(url: string, queryParams?: Record<string, string>, formData?: Record<string, any>): void {
    const state: PendingReservationState = {
      url,
      queryParams,
      formData,
      timestamp: Date.now()
    };
    localStorage.setItem(PENDING_RESERVATION_KEY, JSON.stringify(state));
  }

  /**
   * Recupera o estado da reserva pendente
   */
  getPendingState(): PendingReservationState | null {
    const stored = localStorage.getItem(PENDING_RESERVATION_KEY);
    if (!stored) return null;
    
    try {
      const state = JSON.parse(stored) as PendingReservationState;
      // Remove estados muito antigos (mais de 1 hora)
      if (Date.now() - state.timestamp > 3600000) {
        this.clearPendingState();
        return null;
      }
      return state;
    } catch {
      return null;
    }
  }

  /**
   * Limpa o estado da reserva pendente
   */
  clearPendingState(): void {
    localStorage.removeItem(PENDING_RESERVATION_KEY);
  }

  /**
   * Verifica se há um estado pendente
   */
  hasPendingState(): boolean {
    return this.getPendingState() !== null;
  }
}
