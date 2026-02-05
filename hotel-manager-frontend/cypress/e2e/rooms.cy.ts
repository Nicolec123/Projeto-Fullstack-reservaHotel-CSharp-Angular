describe('Quartos', () => {
  beforeEach(() => {
    cy.visit('/quartos');
  });

  it('deve carregar a lista de quartos', () => {
    cy.url().should('include', 'quartos');
    cy.get('body').should('be.visible');
  });

  it('deve exibir quartos ou mensagem quando vazio', () => {
    cy.get('body').then(($body) => {
      const hasList = $body.find('[data-cy="room-list"], .room-list, table, mat-card, .card').length > 0;
      const hasEmpty = $body.text().includes('Nenhum') || $body.text().includes('nenhum');
      expect(hasList || hasEmpty).to.be.true;
    });
  });
});
