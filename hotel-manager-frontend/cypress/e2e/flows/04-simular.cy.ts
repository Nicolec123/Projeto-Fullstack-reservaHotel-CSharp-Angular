/**
 * Fluxo: Simulação Quarto + Spa (sem login obrigatório para simular)
 */
describe('Fluxo: Simular quarto + spa', () => {
  beforeEach(() => {
    cy.visit('/quartos');
  });

  it('deve ir para simulação a partir da lista de quartos', () => {
    cy.contains('Carregando', { timeout: 5000 }).should('not.exist');
    cy.get('a.btn-details').first().invoke('removeAttr', 'target').click();
    cy.url({ timeout: 8000 }).should('match', /\/quartos\/\d+$/);
    cy.get('.btn-simular, a[routerLink*="simular"]').first().click();
    cy.url({ timeout: 10000 }).should('include', '/simular');
  });

  it('página de simulação deve mostrar quarto e opção de spa', () => {
    cy.contains('Carregando', { timeout: 5000 }).should('not.exist');
    cy.get('a.btn-details').first().invoke('removeAttr', 'target').click();
    cy.url({ timeout: 8000 }).should('match', /\/quartos\/\d+$/);
    cy.get('.btn-simular, a[routerLink*="simular"]').first().click();
    cy.url({ timeout: 10000 }).should('include', 'simular');
    cy.contains('Simulação').should('be.visible');
    cy.contains('Seu quarto').should('be.visible');
    cy.contains('Deseja adicionar Spa').should('be.visible');
    cy.contains('Reservar só o quarto').should('be.visible');
    cy.contains('ir para reserva').should('be.visible');
  });
});
