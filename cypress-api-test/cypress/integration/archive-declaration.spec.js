describe('Archiving declaration', () => {
    let varDeclarationRef = '';
    let varDeclarationRef1 = '';

    before('Send declaration', function() {
      cy.sendDeclaration()
        .then((returned_value) => {
              varDeclarationRef = returned_value
        })

       cy.sendDeclaration()
         .then((returned_value) => {
               varDeclarationRef1 = returned_value
        })
    })

    it('should archive declaration', () => {
        cy.readFile('cypress/fixtures/archive_declaration.xml')
          .then(text => text.replaceAll('$varDeclarationRef', varDeclarationRef))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                Cypress.$(xml).each(function() {
                    expect(Cypress.$(this).find('declarationRef').text()).to.eq(varDeclarationRef);
                    expect(Cypress.$(this).find('status').text()).to.eq('ARCHIVED');
                    expect(response.status).to.eq(200);
                })
          })
    })

    it('should return archived status', () => {
        cy.readFile('cypress/fixtures/declaration_status.xml')
          .then(text => text.replaceAll('$varDeclarationRef', varDeclarationRef))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                Cypress.$(xml).each(function() {
                    expect(Cypress.$(this).find('declarationRef').text()).to.eq(varDeclarationRef);
                    expect(Cypress.$(this).find('status').text()).to.eq('ARCHIVED');
                    expect(response.status).to.eq(200);
                })
         })
    })

    it('should return declaration reference in archived declarations list', () =>  {
        cy.login(Cypress.env('keycloakLoginUsername'), Cypress.env('keycloakLoginPassword'))
        cy.request({
                url: 'http://dev.genmed.ut.ee:8010/declarations/EE:COM:CYPRESS:LOCAL/archived',
                method: 'GET'
        })
        .then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.include(varDeclarationRef);
        })
    })

    it('should not archive if non-existent declaration reference', () => {
        cy.readFile('cypress/fixtures/declaration_status.xml')
          .then(text => text.replaceAll('$varDeclarationRef', '00000000-abcd-123b-456c-123a456b789'))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                Cypress.$(xml).each(function() {
                    expect(Cypress.$(this).find('faultcode').text()).to.eq('NOT_FOUND');
                    expect(Cypress.$(this).find('faultstring').text()).to.eq('Declaration (with same origin as current request) was not found.');
                    expect(response.status).to.eq(200);
                })
        })
    })

    it('should not archive if invalid declaration reference', () => {
        cy.readFile('cypress/fixtures/declaration_status.xml')
          .then(text => text.replaceAll('$varDeclarationRef', 'INVALID'))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                Cypress.$(xml).each(function() {
                    expect(Cypress.$(this).find('faultcode').text()).to.eq('INVALID_DATA');
                    expect(Cypress.$(this).find('faultstring').text()).to.eq('Request contains invalid or insufficient data.');
                    expect(response.status).to.eq(200);
                })
        })
    })

    it('should not archive if declaration in denied status', () => {
       cy.login(Cypress.env('keycloakLoginUsername'), Cypress.env('keycloakLoginPassword'))
       cy.denyDeclaration(varDeclarationRef1);

       cy.readFile('cypress/fixtures/archive_declaration.xml')
         .then(text => text.replaceAll('$varDeclarationRef', varDeclarationRef1))
         .then(text => cy.fetchXML(text))
         .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                Cypress.$(xml).each(function() {
                    expect(Cypress.$(this).find('declarationRef').text()).to.eq(varDeclarationRef1);
                    expect(Cypress.$(this).find('status').text()).to.eq('DENIED');
                    expect(response.status).to.eq(200);
                })
         })
    })

})