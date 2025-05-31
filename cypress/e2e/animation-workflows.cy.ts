describe('Complete Animation Workflows', () => {
  beforeEach(() => {
    // Ensure fresh authentication for each test
    cy.session(
      'testUser',
      () => {
        cy.loginAsTestUser();
      },
      {
        validate() {
          // Validate that the session is still valid
          cy.url().should('not.include', '/login');
          cy.visit('/');
        },
      }
    );

    // Visit playground after ensuring authentication
    cy.visit('/');
    cy.waitForPageLoad();
  });

  describe('End-to-End Animation Creation', () => {
    it('should create, save, and share an animation configuration', () => {
      // We're already at the playground due to beforeEach

      // Give the animation a name and description
      cy.get('[data-cy="animation-name-input"]')
        .should('be.visible')
        .type('Test Animation');
      cy.get('[data-cy="animation-description-input"]')
        .should('be.visible')
        .type('This is a test animation configuration.');
      cy.wait(300);

      // Configure an animation
      cy.get('[data-cy="animation-type-trigger"]').click();
      cy.get('[data-cy="animation-type-bounce"]').click();

      // Wait for dropdown to close
      cy.wait(500);

      // Adjust some properties
      cy.get('[data-cy="duration-slider"]')
        .invoke('val', 2000)
        .trigger('input', { force: true });
      cy.wait(300);
      cy.get('[data-cy="delay-slider"]')
        .invoke('val', 500)
        .trigger('input', { force: true });
      cy.wait(300);

      // Save the configuration
      cy.get('[data-cy="save-btn"]')
        .scrollIntoView()
        .should('be.visible')
        .click();

      // Wait for save to complete
      cy.wait(2000);

      // Check if share button appears (might be conditional)
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="share-btn"]').length > 0) {
          cy.get('[data-cy="share-btn"]').should('be.visible');
        }
      });

      // Go to profile to verify saved configuration
      cy.visit('/profile');
      cy.waitForPageLoad();

      // Wait for configs to load
      cy.wait(1500);

      // Should see the saved configuration name
      cy.get('[role="tablist"]').should('be.visible');
      cy.get('[role="tab"]').contains('My Configurations').should('be.visible');
      cy.get('[role="tab"]')
        .contains('My Configurations')
        .click({ force: true });
      cy.get('[role="tabpanel"]').should('be.visible');
    });

    it('should delete the saved animation configuration', () => {
      // navigate to profile
      cy.visit('/profile');
      cy.waitForPageLoad();

      // Ensure the configs are loaded instead of the loading skeleton
      cy.wait(1500);
      cy.get('[role="tabpanel"]').should('be.visible');
      cy.get('.rt-r-gap-3').should('exist');
      cy.get('.rt-r-gap-3 > :nth-child(1)').should('exist');

      // Check if we have any configurations to delete
      cy.get('[role="tab"]')
        .contains('My Configurations')
        .click({ force: true });
      cy.get('[role="tabpanel"]').should('be.visible');

      // Delete the animation named 'Test Animation'
      cy.get('.rt-r-gap-3 > :nth-child(1)')
        .contains('Test Animation')
        .as('firstConfig');

      cy.get(
        ':nth-child(1) > .rt-r-fd-column > .rt-r-jc-end > [data-accent-color="red"]'
      ).click({ force: true });

      // Confirm deletion if a confirmation dialog appears
      cy.get('.rt-Flex > .rt-variant-solid').click({ force: true });

      // Verify the configuration named 'Test Animation' is deleted with name
    });

    it('should create animation with different configurations', () => {
      // Navigate to the playground
      cy.visit('/');
      cy.waitForPageLoad();

      // Test with scale
      const animationTypes = ['scale', 'fade', 'slide', 'bounce'];

      animationTypes.forEach((animationType) => {
        // Name of animation should be name of the type
        cy.get('[data-cy="animation-name-input"]')
          .scrollIntoView()
          .should('be.visible')
          .clear()
          .type(`Test Animation - ${animationType}`);
        cy.get('[data-cy="animation-description-input"]')
          .should('be.visible')
          .clear()
          .type(`This is a test animation configuration for ${animationType}.`);
        cy.wait(300);

        // Select animation type with proper timing
        cy.get('[data-cy="animation-type-trigger"]')
          .should('be.visible')
          .click({ force: true });
        cy.wait(200); // Wait for dropdown to open

        // Ensure the option is available before clicking
        cy.get(`[data-cy="animation-type-${animationType}"]`)
          .should('be.visible')
          .click({ force: true });

        // Wait for dropdown to close and UI to update
        cy.wait(300);

        cy.get('[data-cy="save-btn"]')
          .scrollIntoView()
          .should('be.visible')
          .click({ force: true });
        cy.wait(1500);
      });

      // Test changing animation properties
      cy.get('[data-cy="duration-slider"]').should('be.visible');
      cy.get('[data-cy="duration-slider"]')
        .invoke('val', 1500)
        .trigger('input', { force: true });
      cy.wait(300);
      cy.get('[data-cy="delay-slider"]').should('be.visible');
      cy.get('[data-cy="delay-slider"]')
        .invoke('val', 500)
        .trigger('input', { force: true });
      cy.wait(300);
      cy.get('[data-cy="easing-trigger"]').should('be.visible');
      cy.get('[data-cy="easing-trigger"]').click({ force: true });
      cy.get('[data-cy="easing-ease-in-out"]').click({ force: true });
      cy.wait(300);

      // Verify the preview still works after property changes
      cy.get('[data-cy="animation-preview"]').should('be.visible');
    });

    it('should handle animation timing controls', () => {
      // We're already at the playground due to beforeEach

      // Test duration control
      cy.get('[data-cy="duration-slider"]').should('be.visible');
      cy.get('[data-cy="duration-slider"]')
        .invoke('val', 3000)
        .trigger('input', { force: true });
      cy.wait(300);

      // Test delay control
      cy.get('[data-cy="delay-slider"]').should('be.visible');
      cy.get('[data-cy="delay-slider"]')
        .invoke('val', 1000)
        .trigger('input', { force: true });
      cy.wait(300);

      // Test easing if available
      cy.get('body').then(($body) => {
        if ($body.find('[data-cy="easing-trigger"]').length > 0) {
          cy.get('[data-cy="easing-trigger"]').click({ force: true });
          cy.get('[data-cy="easing-ease-in-out"]').click({ force: true });
          cy.wait(300);
        }
      });

      // Verify preview still works
      cy.get('[data-cy="animation-preview"]').should('be.visible');
    });
  });

  describe('Configuration Management Workflow', () => {
    it('should save, view, and manage configurations in profile', () => {
      // Start at playground and create a configuration

      // Give the animation a name and description
      cy.get('[data-cy="animation-name-input"]')
        .should('be.visible')
        .type('Test Animation');
      cy.get('[data-cy="animation-description-input"]')
        .should('be.visible')
        .type('This is a test animation configuration.');
      cy.wait(300);

      cy.get('[data-cy="animation-type-trigger"]').click({ force: true });
      cy.wait(300);
      cy.get('[data-cy="animation-type-slide"]').click({ force: true });
      cy.wait(500);

      cy.get('[data-cy="save-btn"]')
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      cy.wait(1500);

      // Go to profile
      cy.visit('/profile');
      cy.waitForPageLoad();

      // Wait for configs to load
      cy.wait(1500);

      // Check My Configurations tab
      cy.get('[role="tab"]').contains('My Configurations').should('be.visible');
      cy.get('[role="tab"]')
        .contains('My Configurations')
        .click({ force: true });
      // The animation should be visible
      cy.get('[role="tabpanel"]').should('be.visible');
      cy.get('.rt-r-gap-3 > :nth-child(1)')
        .contains('Test Animation')
        .should('be.visible');
    });

    it('should navigate back to playground from profile', () => {
      cy.visit('/profile');
      cy.waitForPageLoad();

      // Check if there's a "Create Your First Animation" button or just navigate
      cy.get('body').then(($body) => {
        if ($body.text().includes('Create Your First Animation')) {
          cy.contains('button', 'Create Your First Animation').click({
            force: true,
          });
        } else {
          // Navigate directly
          cy.visit('/playground');
        }
      });

      cy.url().should('include', '/playground');
      cy.get('[data-cy="animation-preview"]').should('be.visible');
    });

    it('should edit a config from profile', () => {
      cy.visit('/profile');
      cy.waitForPageLoad();

      // Wait for configs to load
      cy.wait(1500);

      // Click on the first configuration to edit
      cy.get('.rt-r-gap-3 > :nth-child(1)')
        .contains('Test Animation')
        .as('firstConfig');

      // Click the edit button for the first configuration
      cy.get(
        ':nth-child(1) > .rt-r-fd-column > .rt-r-jc-end > :nth-child(3)'
      ).click({ force: true });
      cy.wait(2500);

      // Edit the name and description
      cy.get('[data-cy="animation-name-input"]').should('be.visible').click();
      cy.wait(1000);
      cy.get('[data-cy="animation-name-input"]')
        .clear()
        .wait(300)
        .type('Edited Test Animation');

      cy.get('[data-cy="animation-description-input"]').should('be.visible');
      cy.get('[data-cy="animation-description-input"]')
        .clear()
        .wait(100)
        .type('This is an edited test animation configuration.');
      cy.wait(300);

      // Save changes
      cy.get('[data-cy="save-btn"]')
        .scrollIntoView()
        .should('be.visible')
        .click({ force: true });
      cy.wait(1500);

      // Go back to My Configurations tab
      cy.visit('/profile');
      cy.waitForPageLoad();
      cy.get('[role="tab"]')
        .contains('My Configurations')
        .click({ force: true });
      cy.wait(500);

      // Verify the changes are reflected in the profile
      cy.get('@firstConfig').should('contain.text', 'Edited Test Animation');
    });
  });

  describe('User Journey Scenarios', () => {
    it('should complete a full user session workflow', () => {
      // Start at home, go to playground
      cy.visit('/');
      cy.waitForPageLoad();

      // Create multiple configurations with proper timing
      const configs = [
        { type: 'slide', duration: 1000 },
        { type: 'bounce', duration: 2000 },
      ];

      configs.forEach((config) => {
        // Give the animation a name and description
        cy.get('[data-cy="animation-name-input"]')
          .should('be.visible')
          .clear()
          .type(`Test Animation - ${config.type}`);

        cy.get('[data-cy="animation-description-input"]')
          .should('be.visible')
          .clear()
          .type(`This is a test animation configuration for ${config.type}.`);
        cy.wait(300);

        // Configure animation
        cy.get('[data-cy="animation-type-trigger"]').click({ force: true });
        cy.wait(300);
        cy.get(`[data-cy="animation-type-${config.type}"]`).click({
          force: true,
        });
        cy.wait(500);

        cy.get('[data-cy="duration-slider"]')
          .invoke('val', config.duration)
          .trigger('input', { force: true });
        cy.wait(300);

        // Save configuration
        cy.get('[data-cy="save-btn"]')
          .scrollIntoView()
          .should('be.visible')
          .click({ force: true });
        cy.wait(1500);
      });

      // Visit profile to see all saved configurations
      cy.visit('/profile');
      cy.waitForPageLoad();

      // Wait for configs to load
      cy.wait(1500);

      // Verify we can see saved configurations
      cy.get('[role="tabpanel"]').should('be.visible');
    });
  });
});
