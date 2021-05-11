describe('Getting declaration', () => {
    let varDeclarationRef = ''

    before('Send declaration', function() {
      cy.sendDeclaration()
        .then((returned_value) => {
              varDeclarationRef = returned_value
        })
    })

    after('Archive declaration', function() {
      cy.archiveDeclaration(varDeclarationRef)
    })

    it('should get declaration details', () => {
        let dateRegistered = '';
        let declarationStatus = '';
        let regex = /(^\d{4}(-\d{2}){0,2})?((^|T)\d{2}(:\d{2}(:\d{2}(\.\d+))))$/g;

        cy.readFile('cypress/fixtures/get_declaration.xml')
        .then(text => text.replaceAll('$varDeclarationRef', varDeclarationRef))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                Cypress.$(xml).each(function() {
                  declarationStatus = Cypress.$(this).find('declaration>status').text()
                  dateRegistered = Cypress.$(this).find('declaration>dateRegistered').text()
                })

                let declarationRef = xml.getElementsByTagName('declaration')[0].getAttribute('ref');
                let snpChrpos = xml.getElementsByTagName('snp')[0].getAttribute('chrpos');
                let snpId = xml.getElementsByTagName('snp')[0].getAttribute('id');
                let usagePerson = xml.getElementsByTagName('usage')[0].getAttribute('person');
                let usageRequest = xml.getElementsByTagName('usage')[0].getAttribute('request');
                let usageSample = xml.getElementsByTagName('usage')[0].getAttribute('sample');

                expect(response.status).to.eq(200);
                expect(declarationStatus).to.eq('REQUESTED');
                expect(regex.test(dateRegistered)).to.be.true;
                expect(declarationRef).to.eq(varDeclarationRef);
                expect(snpChrpos).to.eq('10:94761900');
                expect(snpId).to.eq('rs12248560');
                expect(usagePerson).to.eq('0');
                expect(usageRequest).to.eq('0');
                expect(usageSample).to.eq('0');
          })
    })

    it('should not return declaration details if invalid declaration reference', () =>  {
        let faultcode = '';
        let faultstring = '';

        cy.readFile('cypress/fixtures/get_declaration.xml')
        .then(text => text.replaceAll('$varDeclarationRef', 'INVALID'))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                Cypress.$(xml).each(function() {
                   faultcode = Cypress.$(this).find('faultcode').text()
                   faultstring = Cypress.$(this).find('faultstring').text()
                })

                expect(response.status).to.eq(200);
                expect(faultcode).to.eq('INVALID_DATA');
                expect(faultstring).to.eq('Request contains invalid or insufficient data.');
          })
    })

    it('should not return declaration details if non-existent declaration reference', () =>  {
        let faultcode = '';
        let faultstring = '';

        cy.readFile('cypress/fixtures/get_declaration.xml')
          .then(text => text.replaceAll('$varDeclarationRef', '00000000-abcd-123b-456c-123a456b789'))
             .then(text => cy.fetchXML(text))
             .then((response) => {
                   const xml = Cypress.$.parseXML(response.body)
                   Cypress.$(xml).each(function() {
                       faultcode = Cypress.$(this).find('faultcode').text()
                       faultstring = Cypress.$(this).find('faultstring').text()
                   })

                   expect(response.status).to.eq(200);
                   expect(faultcode).to.eq('NOT_FOUND');
                   expect(faultstring).to.eq('Declaration (with same origin as current request) was not found.');
             })
    })
})