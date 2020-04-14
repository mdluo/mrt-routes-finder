/// <reference types="cypress" />

context('Map', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('shows Google map', () => {
    cy.get('div.gm-style').should('be.visible');
  });
});
