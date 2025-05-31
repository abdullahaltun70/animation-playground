describe('Basic Navigation', () => {
  describe('Unauthenticated Navigation', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearAllSessionStorage();
      cy.clearCookies();
    });

    it('should redirect to login when accessing protected routes', () => {
      cy.visit('/');
      cy.waitForPageLoad();

      // Should redirect to login page
      cy.url().should('include', '/login');
    });

    it('should access login page directly', () => {
      cy.visit('/login');
      cy.waitForPageLoad();

      cy.url().should('include', '/login');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
    });
  });

  describe('Authenticated Navigation', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearAllSessionStorage();
      cy.clearCookies();
      cy.loginAsTestUser();
    });

    it('should access playground after login', () => {
      cy.visit('/playground');
      cy.waitForPageLoad();

      cy.url().should('include', '/playground');
      cy.get('[data-cy="animation-preview"]').should('be.visible');
    });

    it('should access profile page after login', () => {
      cy.visit('/profile');
      cy.waitForPageLoad();

      cy.url().should('include', '/profile');
    });

    it('should navigate between pages', () => {
      // Start at playground
      cy.visit('/playground');
      cy.waitForPageLoad();
      cy.url().should('include', '/playground');

      // Navigate to profile
      cy.visit('/profile');
      cy.waitForPageLoad();
      cy.url().should('include', '/profile');

      // Navigate to documentation
      cy.visit('/documentation');
      cy.waitForPageLoad();
      cy.url().should('include', '/documentation');

      // Navigate back to playground
      cy.visit('/');
      cy.waitForPageLoad();
      cy.url().should('include', '/');
    });
  });
});
