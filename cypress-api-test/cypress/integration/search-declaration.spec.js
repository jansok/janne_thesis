describe('Searching declaration', () => {
    let varDeclarationRef = ''

    before('Send declaration', function() {
      cy.sendDeclaration()
        .then((returned_value) => {
              varDeclarationRef = returned_value
        })
    })

    beforeEach('Login', function() {
      cy.login(Cypress.env('keycloakLoginUsername'), Cypress.env('keycloakLoginPassword'))
    })

    after('Archive declaration', function() {
      cy.archiveDeclaration(varDeclarationRef)
    })

    it('should search declaration by reference', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/search?q=' + varDeclarationRef,
                method: 'GET'
        })
        .then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.include('Displaying 1 row out of total 1.');
            expect(response.body).to.include('Waiting for approval');
            expect(response.body).to.include(varDeclarationRef);
        })
    })

    it('should not return declaration if non-existent reference', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/search?q=00000000-abcd-123b-456c-123a456b789',
                method: 'GET'
        })
        .then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.include('No matching data-usage declaration was found.');
        })
    })
})