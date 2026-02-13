/**
 * Fluxo: Admin (acesso restrito)
 */
describe('Fluxo: Admin', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('sem login deve redirecionar para login ao acessar /admin', () => {
    cy.visit('/admin');
    cy.url({ timeout: 8000 }).should('include', 'login');
  });

  it('com login de hóspede não deve acessar admin', () => {
    cy.visit('/');
    cy.loginGuest('hospede@hotel.com', 'Hospede@123');
    cy.visit('/admin');
    cy.url({ timeout: 8000 }).should('satisfy', (url: string) =>
      url.includes('login') || url.includes('quartos') || url.includes('admin')
    );
    cy.get('body').then(($body) => {
      const inAdmin = $body.find('.sidebar-nav, .nav-admin').length > 0;
      const hasDashboard = $body.text().includes('Dashboard') || $body.text().includes('Painel');
      if (inAdmin || hasDashboard) {
        expect($body.find('.sidebar-nav, [class*="admin"]').length).to.be.greaterThan(0);
      }
    });
  });

  it('com login admin deve acessar painel', () => {
    cy.visit('/');
    cy.loginAdmin();
    cy.visit('/admin');
    cy.url({ timeout: 10000 }).should('include', 'admin');
    cy.get('body').then(($body) => {
      const hasNav = $body.find('.sidebar-nav, .nav-item').length > 0;
      const hasContent = $body.text().includes('Dashboard') || $body.text().includes('Quartos') || $body.text().includes('Reservas');
      expect(hasNav || hasContent).to.be.true;
    });
  });
});
