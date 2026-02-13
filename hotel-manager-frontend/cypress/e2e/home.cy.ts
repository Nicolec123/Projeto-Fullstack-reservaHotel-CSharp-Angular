describe('Home (página inicial)', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('deve carregar a página inicial', () => {
    cy.url().should('include', '/');
    cy.get('body').should('be.visible');
  });

  it('deve exibir elementos principais da home', () => {
    cy.get('nav.nav').should('exist');
    cy.get('main').should('exist');
  });

  it('deve navegar para quartos pelo menu/link', () => {
    cy.contains('Quartos').first().click({ force: true });
    cy.url().should('match', /\/(quartos)?/);
  });

  it('deve navegar para login', () => {
    cy.contains('Entrar').first().click({ force: true });
    cy.url().should('include', 'login');
  });
});
