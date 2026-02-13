/**
 * Fluxo: Minhas reservas (requer login)
 */
describe('Fluxo: Minhas reservas', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('sem login deve redirecionar para login ao acessar minhas-reservas', () => {
    cy.visit('/minhas-reservas');
    cy.url({ timeout: 8000 }).should('include', 'login');
  });

  it('com login deve exibir página minhas reservas (lista ou vazia)', () => {
    const API_URL = 'http://localhost:5001/api';
    cy.visit('/');
    cy.request('POST', `${API_URL}/auth/login`, {
      email: 'hospede@hotel.com',
      senha: 'Hospede@123',
      lembrarDeMim: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      const token = res.body?.token;
      const user = res.body;
      if (!token) return;
      cy.visit('/minhas-reservas', {
        onBeforeLoad(win) {
          win.localStorage.setItem('token', token);
          win.localStorage.setItem('user', JSON.stringify(user));
        },
      });
    });
    cy.url().should('include', 'minhas-reservas');
    cy.contains('Minhas reservas', { timeout: 10000 }).should('be.visible');
    cy.get('body').then(($body) => {
      const hasList = $body.find('.list .card, .card').length > 0;
      const hasEmpty = $body.text().includes('nenhuma reserva') || $body.text().includes('não fez');
      expect(hasList || hasEmpty).to.be.true;
    });
  });

  it('deve ter link para quartos', () => {
    const API_URL = 'http://localhost:5001/api';
    cy.visit('/');
    cy.request('POST', `${API_URL}/auth/login`, {
      email: 'hospede@hotel.com',
      senha: 'Hospede@123',
      lembrarDeMim: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      const token = res.body?.token;
      const user = res.body;
      if (!token) return;
      cy.visit('/minhas-reservas', {
        onBeforeLoad(win) {
          win.localStorage.setItem('token', token);
          win.localStorage.setItem('user', JSON.stringify(user));
        },
      });
    });
    cy.contains('Ver quartos', { timeout: 8000 }).first().click();
    cy.url().should('include', 'quartos');
  });
});
