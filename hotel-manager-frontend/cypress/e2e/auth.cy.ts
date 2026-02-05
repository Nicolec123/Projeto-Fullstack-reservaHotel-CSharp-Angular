describe('Autenticação', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/login');
  });

  it('deve exibir formulário de login', () => {
    cy.get('form').should('exist');
    cy.get('input[type="email"], input[name="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
  });

  it('deve fazer login com hóspede e redirecionar', () => {
    cy.get('input[type="email"], input[name="email"]').first().clear().type('hospede@hotel.com');
    cy.get('input[type="password"]').first().clear().type('Hospede@123');
    cy.get('form').submit();
    cy.url({ timeout: 10000 }).should('not.include', 'login');
  });

  it('deve mostrar erro com credenciais inválidas', () => {
    cy.get('input[type="email"], input[name="email"]').first().clear().type('invalido@test.com');
    cy.get('input[type="password"]').first().clear().type('wrong');
    cy.get('form').submit();
    cy.contains(/inválid|erro|incorreto/i, { timeout: 8000 }).should('be.visible');
  });
});
