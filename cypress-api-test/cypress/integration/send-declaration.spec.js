describe('Sending declaration', () => {
    let varDeclarationRef = '';

    after('Archive declaration', function() {
      cy.archiveDeclaration(varDeclarationRef)
    })

    it('should send declaration', () => {
        cy.readFile('cypress/fixtures/create_declaration.xml')
          .then(text => cy.fetchXML(text))
          .then((response) => {
                let xml = response.body;
                varDeclarationRef = String(xml).match('<declaration ref="(.*?)">')[1];
                expect(response.status).to.eq(200);
                expect(response.body).to.include('<status>REQUESTED</status>');
          })
    })

    it('should return requested status', () => {
        cy.readFile('cypress/fixtures/declaration_status.xml')
          .then(text => text.replaceAll('$varDeclarationRef', varDeclarationRef))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                Cypress.$(xml).each(function() {
                    expect(Cypress.$(this).find('declarationRef').text()).to.eq(varDeclarationRef);
                    expect(Cypress.$(this).find('status').text()).to.eq('REQUESTED');
                    expect(response.status).to.eq(200);
                })
          })
    })

    it('should return declaration reference in waiting for approval declarations list', () =>  {
    cy.login(Cypress.env('keycloakLoginUsername'), Cypress.env('keycloakLoginPassword'))
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/EE:COM:CYPRESS:LOCAL/requested',
                method: 'GET'
            })
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.include(varDeclarationRef);
            })
    })

    it('should not send declaration if invalid certificate', () => {
        cy.readFile('cypress/fixtures/create_declaration_invalid_certificate.xml')
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                Cypress.$(xml).each(function() {
                    expect(Cypress.$(this).find('faultcode').text()).to.eq('INVALID_DATA');
                    expect(Cypress.$(this).find('faultstring').text()).to.eq
                        ('The provided certificate could not be parsed.');
                    expect(response.status).to.eq(200);
                })
          })
    })

    it('should not send declaration if SNPs are missing', () => {
        cy.readFile('cypress/fixtures/create_declaration_missing_snps.xml')
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                Cypress.$(xml).each(function() {
                    expect(Cypress.$(this).find('faultcode').text()).to.eq('INVALID_DATA');
                    expect(Cypress.$(this).find('faultstring').text()).to.eq
                        ('At least one list of SNPs (required/optional) are required.');
                    expect(response.status).to.eq(200);
                })
          })
    })
})