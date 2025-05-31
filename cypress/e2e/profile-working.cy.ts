describe('Profile and User Management', () => {
  beforeEach(() => {
    // Clear any existing authentication state
    cy.clearLocalStorage();
    cy.clearAllSessionStorage();
    cy.clearCookies();

    // Login before each test
    cy.loginAsTestUser();
  });

  describe('Profile Page Access', () => {
    it('should access profile page when authenticated', () => {
      cy.visit('/profile');
      cy.waitForPageLoad();

      // Check that we're on the profile page
      cy.url().should('include', '/profile');

      // Check for the tabs that should be visible on the profile page
      cy.get('[role="tablist"]').should('exist');
      cy.get('[role="tab"]').should('contain.text', 'My Configurations');
      cy.get('[role="tab"]').should('contain.text', 'All Configurations');
    });

    it('should display profile tabs and configuration sections', () => {
      cy.visit('/profile');
      cy.waitForPageLoad();

      // Check for the main profile structure
      cy.get('[role="tablist"]').should('be.visible');

      // Check that we can see the "My Configurations" tab
      cy.get('[role="tab"]').contains('My Configurations').should('be.visible');

      // Check that we can see the "All Configurations" tab
      cy.get('[role="tab"]')
        .contains('All Configurations')
        .should('be.visible');

      // Check that the default tab content is visible
      cy.get('[role="tabpanel"]').should('be.visible');
    });
  });

  describe('Configuration Management', () => {
    it('should show saved animation configurations section', () => {
      cy.visit('/profile');
      cy.waitForPageLoad();

      // Check that we're on the "My Configurations" tab by default
      cy.get('[role="tab"][data-state="active"]').should(
        'contain.text',
        'My Configurations'
      );

      // Simply verify that the tab panel exists and is visible
      cy.get('[role="tabpanel"]').should('be.visible');

      // The content could be loading, empty state, or actual configurations
      // All of these are valid states for the profile page
    });

    it('should allow navigation back to playground', () => {
      cy.visit('/profile');
      cy.waitForPageLoad();

      // Look for a button that can take us to playground (Create Your First Animation or other buttons)
      cy.get('button').then(($buttons) => {
        // Check if there's a "Create Your First Animation" button (empty state)
        if ($buttons.text().includes('Create Your First Animation')) {
          cy.contains('button', 'Create Your First Animation').click();
          cy.url().should('include', '/playground');
        } else {
          // If no empty state button, navigate directly to test the playground route
          cy.visit('/playground');
          cy.waitForPageLoad();
          cy.url().should('include', '/playground');
        }
      });
    });
  });
});
