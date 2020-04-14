/// <reference types="cypress" />

context('Stations', () => {
  const drawer = `div.bp3-card[class*="Drawer_drawer"]`;
  const input = `input.bp3-input[type=text]`;
  const menu = `.bp3-popover.bp3-select-popover ul.bp3-menu`;
  const swap = `button[title="Swap"]`;

  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('select stations', () => {
    cy.get(`${input}:not([disabled])`).eq(0).click();
    cy.get(menu)
      .should('be.visible')
      .children('li')
      .should('have.length.gt', 1);
    cy.get(menu).children('li').eq(0).click();
    cy.get(`${input}:not([disabled])`)
      .eq(0)
      .its('val')
      .should('have.length.gt', 0);

    cy.get(drawer).click();

    cy.get(`${input}:not([disabled])`).eq(1).click();
    cy.get(menu)
      .should('be.visible')
      .children('li')
      .should('have.length.gt', 1);
    cy.get(menu)
      .children('li')
      .eq(0)
      .children('.bp3-menu-item')
      .should('have.class', 'bp3-disabled');
    cy.get(menu).children('li').eq(2).click();
  });

  context('Swap', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000?start=Jurong+Pier&end=Punggol+Point');
    });

    it('swaps the start and end stations', () => {
      cy.get(input).eq(0).should('have.value', 'Jurong Pier');
      cy.get(input).eq(1).should('have.value', 'Punggol Point');
      cy.get(swap).click();
      cy.get(input).eq(0).should('have.value', 'Punggol Point');
      cy.get(input).eq(1).should('have.value', 'Jurong Pier');
    });
  });
});
