describe('User Profile and Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.loginAsTestUser();

    // Intercept API calls
    cy.intercept('GET', '**/api/profile/**').as('getProfile');
    cy.intercept('PUT', '**/api/profile/**').as('updateProfile');
    cy.intercept('GET', '**/api/configs/user/**').as('getUserConfigs');
    cy.intercept('DELETE', '**/api/configs/**').as('deleteConfig');
  });

  describe('Profile Page Load', () => {
    it('should load user profile successfully', () => {
      cy.visit('/profile');
      cy.waitForPageLoad();

      // Check page title

      cy.get('[data-cy="profile-header"]').should('contain.text', 'Profile');

      // Check profile components are visible
      cy.get('[data-cy="profile-info"]').should('be.visible');
      cy.get('[data-cy="saved-configurations"]').should('be.visible');
      cy.get('[data-cy="profile-settings"]').should('be.visible');
    });

    it('should display user information correctly', () => {
      cy.visit('/profile');
      cy.waitForPageLoad();

      // Check user info is displayed
      cy.get('[data-cy="user-name"]').should('be.visible').and('not.be.empty');
      cy.get('[data-cy="user-email"]').should('be.visible').and('not.be.empty');
      cy.get('.rt-AvatarFallback').should('be.visible');
      cy.get('[data-cy="member-since"]').should('be.visible');
    });

    it('should load user saved configurations', () => {
      cy.visit('/profile');
      cy.waitForPageLoad();

      // Check configurations section
      cy.get('[data-cy="saved-configurations"]').should('be.visible');
      cy.get('[data-cy="configurations-count"]').should('be.visible');
    });
  });

  describe('Profile Information Management', () => {
    beforeEach(() => {
      cy.visit('/profile');
      cy.waitForPageLoad();
    });

    // TODO: Add profile information management tests
  });

  describe('Saved Configurations Management', () => {
    beforeEach(() => {
      cy.visit('/profile');
      cy.waitForPageLoad();
    });

    it('should delete configuration with confirmation', () => {
      // Mock the delete API call
      cy.intercept('DELETE', '**/api/configs/**', {
        statusCode: 200,
        body: { message: 'Configuration deleted successfully' },
      }).as('deleteConfig');

      // Check if there are any configuration cards first
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="delete-config-button"]').length > 0) {
          // Get initial count of configuration cards
          cy.get('.rt-Box').then(($cards) => {
            const initialCount = $cards.length;

            // Click the first delete button
            cy.get('[data-cy="delete-config-button"]').first().click();

            // Confirm deletion in the alert dialog
            cy.get('[role="dialog"]').should('be.visible');
            cy.get('[role="dialog"]').within(() => {
              cy.contains('Confirm Deletion').should('be.visible');
              cy.get('button').contains('Delete').click();
            });

            // Wait for delete request
            cy.wait('@deleteConfig');

            // Check success message appears
            cy.contains('Configuration deleted successfully', {
              timeout: 10000,
            }).should('be.visible');

            // Verify configuration count decreased
            cy.get('.rt-Box').should('have.length', initialCount - 1);
          });
        } else {
          cy.log('No configurations found to delete');
        }
      });
    });

    it('should cancel configuration deletion', () => {
      // Check if there are any configuration cards first
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="delete-config-button"]').length > 0) {
          // Get initial count of configuration cards
          cy.get('.rt-Box').then(($cards) => {
            const initialCount = $cards.length;

            // Click the first delete button
            cy.get('[data-cy="delete-config-button"]').first().click();

            // Cancel deletion in the alert dialog
            cy.get('[role="dialog"]').should('be.visible');
            cy.get('[role="dialog"]').within(() => {
              cy.contains('Confirm Deletion').should('be.visible');
              cy.get('button').contains('Cancel').click();
            });

            // Configuration should still be there
            cy.get('.rt-Box').should('have.length', initialCount);
          });
        } else {
          cy.log('No configurations found to test deletion cancellation');
        }
      });
    });
  });
});
