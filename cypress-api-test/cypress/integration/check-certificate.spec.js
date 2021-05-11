describe('Checking certificate', () => {
    let regex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2})$/g;
    let varDeclarationRef = '';
    let varDeclarationRef1 = '';
    let validMemberCode = 'CYPRESS';
    let invalidMemberCode = 'NON-EXISTENT';

    before('Send declarations', function() {
      cy.sendDeclaration()
        .then((returned_value) => {
              varDeclarationRef = returned_value
        })
    })

    after('Archive declarations', function() {
      cy.archiveDeclaration(varDeclarationRef)
      cy.archiveDeclaration(varDeclarationRef1)
    })

    it('should return certificate', () => {
        let declarationRef = '';

        cy.readFile('cypress/fixtures/check_certificate.xml')
          .then(text => text.replaceAll('$memberCode', validMemberCode))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                Cypress.$(xml).each(function() {
                    declarationRef = Cypress.$(this).find('declarationRef').text()
                })
                let certificateCount = xml.getElementsByTagName('certificate').length;
                let declarationRefCount = xml.getElementsByTagName('declarationRef').length;
                let certificateNotAfter = xml.getElementsByTagName('certificate')[0].getAttribute('notAfter');
                let certificateNotBefore = xml.getElementsByTagName('certificate')[0].getAttribute('notBefore');
                let certificateSerial = xml.getElementsByTagName('certificate')[0].getAttribute('serial');
                let certificateStatus = xml.getElementsByTagName('certificate')[0].getAttribute('status');

                expect(response.status).to.eq(200);
                expect(certificateCount).to.eq(1);
                expect(declarationRefCount).to.eq(1);
                expect(declarationRef).to.eq(varDeclarationRef);
                expect(regex.test(certificateNotAfter)).to.be.true;
                regex.lastIndex = 0;
                expect(regex.test(certificateNotBefore)).to.be.true;
                expect(certificateSerial).to.eq('131333555150875993320071611895640363504602083243');
                expect(certificateStatus).to.eq('OK');
        })
   })

    it('should not return certificate when non-existent company', () => {
        cy.readFile('cypress/fixtures/check_certificate.xml')
          .then(text => text.replaceAll('$memberCode', invalidMemberCode))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body);
                let certificateCount = xml.getElementsByTagName('certificate').length;
                let declarationRefCount = xml.getElementsByTagName('declarationRef').length;
                expect(response.status).to.eq(200);
                expect(certificateCount).to.eq(0);
                expect(declarationRefCount).to.eq(0);
        })
   })

    it('should return only active declarations references', () => {
      cy.sendDeclaration()
        .then((returned_value) => {
              varDeclarationRef1 = returned_value
        })

      cy.login(Cypress.env('keycloakLoginUsername'), Cypress.env('keycloakLoginPassword'))
      cy.approveDeclaration(varDeclarationRef);

        cy.readFile('cypress/fixtures/check_certificate.xml')
          .then(text => text.replaceAll('$memberCode', validMemberCode))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                let certificateCount = xml.getElementsByTagName('certificate').length;
                let declarationRefCount = xml.getElementsByTagName('declarationRef').length;
                let certificateNotAfter = xml.getElementsByTagName('certificate')[0].getAttribute('notAfter');
                let certificateNotBefore = xml.getElementsByTagName('certificate')[0].getAttribute('notBefore');
                let certificateSerial = xml.getElementsByTagName('certificate')[0].getAttribute('serial');
                let certificateStatus = xml.getElementsByTagName('certificate')[0].getAttribute('status');

                expect(certificateCount).to.eq(1);
                expect(response.status).to.eq(200);
                regex.lastIndex = 0;
                expect(regex.test(certificateNotAfter)).to.be.true;
                regex.lastIndex = 0;
                expect(regex.test(certificateNotBefore)).to.be.true;
                expect(certificateSerial).to.eq('131333555150875993320071611895640363504602083243');
                expect(declarationRefCount).to.eq(2);
                expect(certificateStatus).to.eq('OK');
          })
    })
})