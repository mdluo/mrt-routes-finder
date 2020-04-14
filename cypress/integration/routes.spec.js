/// <reference types="cypress" />

context('Routes', () => {
  const route = `td[class*="Route_route"]`;
  const timeline = `ul[class*="Timeline_timeline"]`;

  beforeEach(() => {
    cy.visit('http://localhost:3000?start=Jurong+Pier&end=Punggol+Point');
  });

  it('shows 3 suggested routes', () => {
    cy.get(route).should('have.length', 3).eq(0).should('have.class', 'active');

    cy.get(route).eq(1).click().should('have.class', 'active');
  });

  it('shows details when click on "DETAILS"', () => {
    cy.get(route).eq(1).contains('DETAILS').should('be.visible').click();
    cy.get(route).eq(1).get(timeline).should('be.visible');
  });

  context('No route found', () => {
    beforeEach(() => {
      cy.visit(
        'http://localhost:3000?start=Nanyang+Crescent&end=Punggol+Point'
      );
    });

    it('shows no route found message', () => {
      cy.get(route).should('have.length', 0);
      cy.contains('No route found').should('be.visible');
    });
  });
});
