describe('CI Environment Validation', () => {
  before(() => {
    // Check application health before running any tests
    cy.checkAppHealth();
  });

  it('should connect to application health endpoint', () => {
    cy.request('/api/health').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', 'ok');
      expect(response.body).to.have.property('supabaseConfigured', true);
      cy.log('Health check passed:', JSON.stringify(response.body));
    });
  });

  it('should load the homepage (allowing redirects)', () => {
    cy.visit('/', { timeout: 30000 });

    // Allow either home page or redirect to login
    cy.url().then((url) => {
      if (url.includes('/login')) {
        cy.log('Redirected to login page (expected for unauthenticated users)');
        cy.get('input[type="email"]').should('be.visible');
        cy.get('input[type="password"]').should('be.visible');
      } else {
        cy.log('Loaded homepage directly');
        cy.get('body').should('be.visible');
      }
    });
  });

  it('should access login page directly', () => {
    cy.visit('/login', { timeout: 30000 });

    cy.url().should('include', '/login');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });
});
