describe('Stopping declaration', () => {
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

    it('should not stop declaration if not in approved state', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/' + varDeclarationRef + '/stop',
                failOnStatusCode: false,
                method: 'POST'
        })
        .then((response) => {
            expect(response.status).to.eq(404);
            expect(response.body).to.not.be.null;
            expect(response.body).property('title').to.contain
                ('Not found: the requested data-usage declaration in APPROVED state was not found on the server.');
        })
    })

    it('should stop declaration if in approved state', () =>  {
        cy.approveDeclaration(varDeclarationRef);
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/' + varDeclarationRef + '/stop',
                method: 'POST'
        })
        .then((response) => {
            expect(response.status).to.eq(204);
        })
    })

    it('should return stopped status', () => {
        cy.readFile('cypress/fixtures/declaration_status.xml')
          .then(text => text.replaceAll('$varDeclarationRef', varDeclarationRef))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.include('STOPPED');
          })
    })

    it('should return declaration reference in stopped declarations list', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/EE:COM:CYPRESS:LOCAL/stopped',
                method: 'GET'
        })
        .then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.include(varDeclarationRef);
        })
    })

    it('should not stop declaration if already stopped', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/' + varDeclarationRef + '/stop',
                failOnStatusCode: false,
                method: 'POST'
        })
        .then((response) => {
            expect(response.status).to.eq(404);
            expect(response.body).to.not.be.null;
            expect(response.body).property('title').to.contain('Not found');
        })
    })

    it('should not stop declaration if invalid declaration reference', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/INVALID/stop',
                failOnStatusCode: false,
                method: 'POST'
        })
        .then((response) => {
            cy.log('BODY: ', response.body)
            expect(response.body).to.not.be.null;
            expect(response.status).to.eq(404);
            expect(response.body).property('title').to.contain('Not found');
        })
    })

    it('should not stop declaration if non-existent declaration reference', () =>  {
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/00000000-abcd-123b-456c-123a456b789/stop',
                failOnStatusCode: false,
                method: 'POST'
        })
        .then((response) => {
            expect(response.status).to.eq(404);
            expect(response.body).property('title').to.contain('Not found');
        })
    })
})