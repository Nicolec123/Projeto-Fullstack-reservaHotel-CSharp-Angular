/**
 * Fluxo: Agendamento Spa (escolher pacote, dados, confirmar)
 */
describe('Fluxo: Agendamento Spa', () => {
  beforeEach(() => {
    cy.visit('/spa/agendar');
  });

  it('deve exibir lista de pacotes de spa', () => {
    cy.url().should('include', 'spa/agendar');
    cy.contains('Escolha seu Pacote').should('be.visible');
    cy.get('body').then(($body) => {
      const cards = $body.find('.package-card, .package-card .btn-select');
      expect(cards.length).to.be.greaterThan(0);
    });
  });

  it('deve avançar ao selecionar pacote e preencher dados', () => {
    cy.get('.package-card').first().click();
    cy.contains('Dados do Agendamento', { timeout: 12000 }).should('be.visible');

    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const dataStr = amanha.toISOString().slice(0, 10);

    cy.get('input[formControlName="dataAgendamento"]').clear().type(dataStr);
    cy.get('select[formControlName="horario"]').select(1);
    cy.get('input[formControlName="nome"]').clear().type('Cliente Teste Spa');
    cy.get('input[formControlName="email"]').clear().type('spa.e2e@test.com');
    cy.get('input[formControlName="telefone"]').clear().type('11999997777');
    cy.contains('button', 'Continuar').click();

    cy.contains('Revisão do Agendamento', { timeout: 8000 }).should('be.visible');
    cy.get('input[value="pix"]').check({ force: true });
    cy.contains('button', 'Confirmar Agendamento').click();

    cy.contains('Agendamento Confirmado', { timeout: 12000 }).should('be.visible');
  });
});
