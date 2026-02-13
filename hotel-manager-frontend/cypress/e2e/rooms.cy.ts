describe('Quartos', () => {
  beforeEach(() => {
    cy.visit('/quartos');
  });

  it('deve carregar a lista de quartos', () => {
    cy.url().should('include', 'quartos');
    cy.get('body').should('be.visible');
  });

  it('deve exibir quartos ou mensagem quando vazio', () => {
    cy.contains('Carregando', { timeout: 8000 }).should('not.exist');
    cy.get('.room-list, .empty-state', { timeout: 5000 }).should('exist');
    cy.get('body').then(($body) => {
      const hasList = $body.find('.room-list .room-card').length > 0;
      const hasEmpty = $body.find('.empty-state').length > 0 || $body.text().includes('Nenhum quarto');
      expect(hasList || hasEmpty).to.be.true;
    });
  });
});
