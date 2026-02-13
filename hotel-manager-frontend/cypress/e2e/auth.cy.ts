describe('Autenticação', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/login');
  });

  it('deve exibir formulário de login', () => {
    cy.get('form').should('exist');
    cy.get('input[formControlName="email"]').should('exist');
    cy.get('input[formControlName="senha"]').should('exist');
  });

  it('deve fazer login com hóspede e redirecionar', () => {
    cy.get('input[formControlName="email"]').clear().type('hospede@hotel.com');
    cy.get('input[formControlName="senha"]').clear().type('Hospede@123');
    cy.get('form').submit();
    cy.url({ timeout: 10000 }).should('not.include', 'login');
  });

  it('deve mostrar erro com credenciais inválidas', () => {
    cy.get('input[formControlName="email"]').clear().type('invalido@test.com');
    cy.get('input[formControlName="senha"]').clear().type('wrong');
    cy.get('form').submit();
    cy.contains(/inválid|erro|incorreto/i, { timeout: 8000 }).should('be.visible');
  });
});
