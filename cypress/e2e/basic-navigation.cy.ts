describe('Basic Navigation', () => {
  describe('Environment Check', () => {
    it('should verify application is running', () => {
      cy.log('Testing environment connectivity...');
      cy.request({
        method: 'GET',
        url: '/',
        timeout: 30000,
        retryOnNetworkFailure: true,
        failOnStatusCode: false,
      }).then((response) => {
        cy.log(`Response status: ${response.status}`);
        expect(response.status).to.be.oneOf([200, 302, 307]); // Allow redirects
      });
    });
  });

  describe('Unauthenticated Navigation', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearAllSessionStorage();
      cy.clearCookies();
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
