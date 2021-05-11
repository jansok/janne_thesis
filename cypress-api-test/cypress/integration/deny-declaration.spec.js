describe('Denying declaration', () => {
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

    it('should deny declaration', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/' + varDeclarationRef + '/deny',
                method: 'POST'
        })
        .then((response) => {
            expect(response.status).to.eq(204);
        })
    })

    it('should return denied status', () => {
        cy.readFile('cypress/fixtures/declaration_status.xml')
          .then(text => text.replaceAll('$varDeclarationRef', varDeclarationRef))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                Cypress.$(xml).each(function() {
                    expect(Cypress.$(this).find('declarationRef').text()).to.eq(varDeclarationRef);
                    expect(Cypress.$(this).find('status').text()).to.eq('DENIED');
                    expect(response.status).to.eq(200);
                })
        })
    })

    it('should return declaration reference in denied declarations list', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/EE:COM:CYPRESS:LOCAL/denied',
                method: 'GET'
        })
        .then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.include(varDeclarationRef);
        })
    })

    it('should not deny declaration if already denied', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/' + varDeclarationRef + '/deny',
                failOnStatusCode: false,
                method: 'POST'
        })
        .then((response) => {
            expect(response.status).to.eq(404);
            expect(response.body).to.not.be.null;
            expect(response.body).property('title').to.contain('Not found');
        })
    })

    it('should not deny declaration if invalid declaration reference', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/INVALID/deny',
                failOnStatusCode: false,
                method: 'POST'
        })
        .then((response) => {
            expect(response.body).to.not.be.null;
            expect(response.status).to.eq(404);
            expect(response.body).property('title').to.contain('Not found');
        })
    })

    it('should not deny declaration if non-existent declaration reference', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/00000000-abcd-123b-456c-123a456b789/deny',
                failOnStatusCode: false,
                method: 'POST'
        })
        .then((response) => {
            expect(response.status).to.eq(404);
            expect(response.body).property('title').to.contain('Not found');
        })
    })
})