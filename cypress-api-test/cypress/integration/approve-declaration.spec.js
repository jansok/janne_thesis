describe('Approving declaration', () => {
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

    it('should approve declaration', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/' + varDeclarationRef + '/approve',
                method: 'POST'
        })
        .then((response) => {
            expect(response.status).to.eq(204);
        })
    })

    it('should return approved status', () => {
        cy.readFile('cypress/fixtures/declaration_status.xml')
          .then(text => text.replaceAll('$varDeclarationRef', varDeclarationRef))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                Cypress.$(xml).each(function() {
                    expect(Cypress.$(this).find('declarationRef').text()).to.eq(varDeclarationRef);
                    expect(Cypress.$(this).find('status').text()).to.eq('APPROVED');
                    expect(response.status).to.eq(200);
                })
        })
    })

    it('should return declaration reference in approved declarations list', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/EE:COM:CYPRESS:LOCAL/approved',
                method: 'GET'
        })
        .then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.include(varDeclarationRef);
        })
    })

    it('should not approve declaration if already approved', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/' + varDeclarationRef + '/approve',
                failOnStatusCode: false,
                method: 'POST'
        })
        .then((response) => {
            expect(response.status).to.eq(404);
            expect(response.body).to.not.be.null;
            expect(response).property('body').to.contain({
                  title:
                  'Not found: the requested data-usage declaration in REQUESTED state was not found on the server.'
            })
        })
    })

    it('should not approve declaration if invalid declaration reference', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/INVALID/approve',
                failOnStatusCode: false,
                method: 'POST'
            })
        .then((response) => {
            expect(response.body).to.not.be.null;
            expect(response.status).to.eq(404);
            expect(response).property('body').to.contain({
                  title: 'Not found: the requested page was not found on the server.'
            })
        })
    })

    it('should not approve declaration if non-existent declaration reference', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/00000000-abcd-123b-456c-123a456b789/approve',
                failOnStatusCode: false,
                method: 'POST'
        })
        .then((response) => {
            expect(response.status).to.eq(404);
            expect(response.body).property('title').to.contain('Not found');
        })
    })
})