/**
 * Fluxo: Cadastro de novo usuário (hóspede)
 */
describe('Fluxo: Cadastro', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/cadastro');
  });

  it('deve exibir formulário de cadastro em etapas', () => {
    cy.url().should('include', 'cadastro');
    cy.contains('Criar conta').should('be.visible');
    cy.contains('Dados essenciais').should('be.visible');
    cy.get('input[formControlName="nome"]').should('exist');
    cy.get('input[formControlName="email"]').should('exist');
    cy.get('input[formControlName="senha"]').should('exist');
  });

  it('deve avançar para etapa 2 ao preencher dados essenciais', () => {
    cy.get('input[formControlName="nome"]').clear().type('Teste E2E Usuario');
    cy.get('input[formControlName="email"]').clear().type('e2e.cadastro.' + Date.now() + '@test.com');
    cy.get('input[formControlName="senha"]').clear().type('Senha123!');
    cy.get('input[formControlName="confirmarSenha"]').clear().type('Senha123!');
    cy.contains('button', 'Continuar').click();
    cy.contains('Documento').should('be.visible');
    cy.get('input[formControlName="cpf"]').should('exist');
  });

  it('deve ter link para login', () => {
    cy.contains('Já tem conta?').should('be.visible');
    cy.get('a[routerLink="/login"]').first().click();
    cy.url().should('include', 'login');
  });
});
