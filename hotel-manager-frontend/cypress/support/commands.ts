const API_URL = 'http://localhost:5001/api';

Cypress.Commands.add('loginGuest', (email = 'hospede@hotel.com', password = 'Hospede@123') => {
  cy.request('POST', `${API_URL}/auth/login`, { email, senha: password, lembrarDeMim: false })
    .then((res) => {
      expect(res.status).to.eq(200);
      const token = res.body?.accessToken;
      if (token) {
        window.localStorage.setItem('token', token);
        window.localStorage.setItem('user', JSON.stringify(res.body));
      }
    });
});

Cypress.Commands.add('loginAdmin', () => {
  cy.request('POST', `${API_URL}/admin/login`, {
    email: 'admin@hotel.com',
    senha: 'Admin@123',
  }).then((res) => {
    expect(res.status).to.eq(200);
    const token = res.body?.accessToken;
    if (token) {
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('user', JSON.stringify(res.body));
    }
  });
});
