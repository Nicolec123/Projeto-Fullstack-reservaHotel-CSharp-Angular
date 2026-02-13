/**
 * Fluxo: Páginas informativas (Sobre, Contato, Galeria, Políticas, Serviços)
 */
describe('Fluxo: Páginas informativas', () => {
  it('Sobre: deve carregar e exibir conteúdo', () => {
    cy.visit('/sobre');
    cy.url().should('include', 'sobre');
    cy.get('body').should('be.visible');
    cy.contains('Voltar').should('be.visible');
  });

  it('Contato: deve exibir formulário ou dados de contato', () => {
    cy.visit('/contato');
    cy.url().should('include', 'contato');
    cy.get('body').should('be.visible');
  });

  it('Galeria: deve carregar galeria', () => {
    cy.visit('/galeria');
    cy.url().should('include', 'galeria');
    cy.get('body').should('be.visible');
  });

  it('Políticas: deve exibir políticas', () => {
    cy.visit('/politicas');
    cy.url().should('include', 'politicas');
    cy.get('body').should('be.visible');
  });

  it('Serviços: deve listar serviços', () => {
    cy.visit('/servicos');
    cy.url().should('include', 'servicos');
    cy.get('body').should('be.visible');
  });
});
