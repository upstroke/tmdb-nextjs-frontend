import { mount } from 'cypress/react';

// Registers cy.mount() for Cypress Component Testing.
// Global styles or providers required by components should be imported/wrapped here.
Cypress.Commands.add('mount', mount);
