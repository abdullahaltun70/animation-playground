describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear any existing authentication state
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();
    cy.clearCookies();
  });

  describe('Login Page', () => {
    it('should display login form', () => {
      cy.visit('/login');
      cy.waitForPageLoad();

      // Check that login form elements are present
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');

      // Check page content
      cy.contains('Sign in').should('be.visible');
    });

    it('should successfully login with valid credentials', () => {
      cy.visit('/login');
      cy.waitForPageLoad();

      // Fill in valid credentials
      cy.get('input[type="email"]').type('a.altun70@outlook.com');
      cy.get('input[type="password"]').type('abdullah');
      cy.get('button[type="submit"]').click();

      // Should redirect away from login page
      cy.url({ timeout: 10000 }).should('not.include', '/login');
      cy.waitForPageLoad();
    });
  });

  describe('Authentication State', () => {
    it('should maintain login state across page refreshes', () => {
      // Login first
      cy.loginAsTestUser();

      // Refresh the page
      cy.reload();
      cy.waitForPageLoad();

      // Should still be logged in (not redirected to login)
      cy.url().should('not.include', '/login');
    });
  });

  describe('Protected Routes', () => {
    it('should allow access to playground when authenticated', () => {
      // Login first
      cy.loginAsTestUser();

      // Visit playground route
      cy.visit('/playground');
      cy.waitForPageLoad();

      // Should be able to access the route
      cy.url().should('include', '/playground');
    });
  });
});
