describe('Resuming declaration', () => {
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

    it('should not resume declaration if not in stopped state', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/' + varDeclarationRef + '/resume',
                failOnStatusCode: false,
                method: 'POST'
        })
        .then((response) => {
            expect(response.status).to.eq(404);
            expect(response.body).to.not.be.null;
            expect(response.body).property('title').to.contain
                ('Not found: the requested data-usage declaration in STOPPED state was not found on the serve');
        })
    })

    it('should resume declaration if in stopped state', () =>  {
        cy.approveDeclaration(varDeclarationRef);
        cy.stopDeclaration(varDeclarationRef);
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/' + varDeclarationRef + '/resume',
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
                expect(response.status).to.eq(200);
                expect(response.body).to.include('APPROVED');
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

    it('should not resume declaration if already in approved state', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/' + varDeclarationRef + '/resume',
                failOnStatusCode: false,
                method: 'POST'
        })
        .then((response) => {
            expect(response.status).to.eq(404);
            expect(response.body).to.not.be.null;
            expect(response.body).property('title').to.contain('Not found');
        })
    })

    it('should not resume declaration if invalid declaration reference', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/INVALID/resume',
                failOnStatusCode: false,
                method: 'POST'
        })
        .then((response) => {
            expect(response.body).to.not.be.null;
            expect(response.status).to.eq(404);
            expect(response.body).property('title').to.contain('Not found');
        })
    })

    it('should not resume declaration if non-existent declaration reference', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/00000000-abcd-123b-456c-123a456b789/resume',
                failOnStatusCode: false,
                method: 'POST'
        })
        .then((response) => {
            expect(response.status).to.eq(404);
            expect(response.body).property('title').to.contain('Not found');
        })
    })
})