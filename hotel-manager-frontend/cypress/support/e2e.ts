// ***********************************************************
// Suporte E2E - Cypress
// ***********************************************************
import './commands';

declare global {
  namespace Cypress {
    interface Chainable {
      loginGuest(email?: string, password?: string): Chainable<void>;
      loginAdmin(): Chainable<void>;
    }
  }
}
