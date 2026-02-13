/**
 * Fluxo completo: Login -> Quartos -> Reservar -> Datas -> Hóspede -> Pagamento -> Sucesso
 */
const API_URL = 'http://localhost:5001/api';

describe('Fluxo: Reserva completa', () => {
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  const depois = new Date(amanha);
  depois.setDate(depois.getDate() + 2);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('deve completar reserva: login, quarto, datas, hóspede, pagamento', () => {
    cy.request('POST', `${API_URL}/auth/login`, {
      email: 'hospede@hotel.com',
      senha: 'Hospede@123',
      lembrarDeMim: false,
    }).then((res) => {
      expect(res.status).to.eq(200);
      const token = res.body?.token;
      const user = res.body;
      if (!token) return;
      cy.visit('/quartos');
      cy.window().then((win) => {
        win.localStorage.setItem('token', token);
        win.localStorage.setItem('user', JSON.stringify(user));
      });
    });
    cy.url().should('include', 'quartos');
    cy.contains('Carregando', { timeout: 8000 }).should('not.exist');

    cy.get('a.btn-details').first().invoke('removeAttr', 'target').click();
    cy.url({ timeout: 8000 }).should('match', /\/quartos\/\d+$/);
    cy.get('button.btn-reserve, .btn.btn-reserve').first().click();

    cy.url({ timeout: 12000 }).should('include', '/reservar/');

    cy.contains('Passo 1').should('be.visible');
    cy.get('input[formControlName="dataInicio"]').clear().type(fmt(amanha));
    cy.get('input[formControlName="dataFim"]').clear().type(fmt(depois));
    cy.contains('button', 'Continuar').click();

    cy.contains('Passo 2', { timeout: 8000 }).should('be.visible');
    cy.get('input[formControlName="telefone"]').clear().type('11999998888');
    cy.contains('button', 'Continuar').click();

    cy.contains('Passo 3', { timeout: 8000 }).should('be.visible');
    cy.contains('Revisar e pagamento').should('be.visible');
    cy.get('input[value="Pix"]').check({ force: true });
    cy.contains('button', 'Confirmar e finalizar').click();

    cy.contains('Reserva confirmada!', { timeout: 15000 }).should('be.visible');
    cy.contains('Nº da reserva').should('be.visible');
  });
});
