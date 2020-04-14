/// <reference types="cypress" />

context('Drawer', () => {
  const drawer = `div.bp3-card[class*="Drawer_drawer"]`;
  const drawerWidth = 350;
  const toggle = `button.bp3-button[class*="Drawer_toggle"]`;

  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('toggles drawer', () => {
    cy.get(drawer).should('be.visible');
    cy.get(toggle).should('be.visible');
    // wait for drawer to expand
    cy.get(drawer).should('have.css', 'left', '0px');
    cy.get(toggle).click();
    cy.get(drawer).should('have.css', 'left', `-${drawerWidth}px`);
    cy.get(toggle).click();
    cy.get(drawer).should('have.css', 'left', `0px`);
  });
});
