describe('Checking certificate', () => {
    let varDeclarationRef = '';
    let varDeclarationRef1 = '';
    let varDeclarationRef2 = '';

    before('Send declarations', function() {
      cy.sendDeclaration()
        .then((returned_value) => {
              varDeclarationRef = returned_value
        })

      cy.sendDeclaration()
        .then((returned_value) => {
              varDeclarationRef1 = returned_value
        })

      cy.sendDeclaration()
        .then((returned_value) => {
              varDeclarationRef2 = returned_value
        })
    })

    after('Archive declarations', function() {
      cy.archiveDeclaration(varDeclarationRef)
    })

    it('check declaration certificate dates', () => {
      cy.getCertificateDates('2024-02-22T14:25:29+02:00', '2021-02-22T14:25:29+02:00')
    })

    it('should update certificate', () => {
      cy.readFile('cypress/fixtures/update_certificate.xml')
        .then(text => text.replaceAll('$varDeclarationRef', varDeclarationRef))
        .then(text => cy.fetchXML(text))
        .then((response) => {
              const xml = Cypress.$.parseXML(response.body)
              let declarationRefCount = xml.getElementsByTagName('declarationRef').length;
              let certificateNotAfter = xml.getElementsByTagName('certificate')[0].getAttribute('notAfter');
              let certificateNotBefore = xml.getElementsByTagName('certificate')[0].getAttribute('notBefore');
              let certificateSerial = xml.getElementsByTagName('certificate')[0].getAttribute('serial');
              let certificateStatus = xml.getElementsByTagName('certificate')[0].getAttribute('status');

              expect(declarationRefCount).to.eq(1);
              expect(certificateNotAfter).to.eq('2031-04-27T16:50:54+03:00');
              expect(certificateNotBefore).to.eq('2021-04-29T16:50:54+03:00');
              expect(certificateSerial).to.eq('291995615131967462503192298240288175007446965937');
              expect(certificateStatus).to.eq('OK');

        })
     })

    it('should not update certificate if expired end date', () => {
        cy.readFile('cypress/fixtures/update_certificate_expired_end_date.xml')
          .then(text => text.replaceAll('$varDeclarationRef', varDeclarationRef))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                Cypress.$(xml).each(function() {
                    expect(Cypress.$(this).find('faultcode').text()).to.eq('INVALID_DATA');
                    expect(Cypress.$(this).find('faultstring').text()).to.eq
                        ('The provided certificate has already expired.');
                    expect(response.status).to.eq(200);
                })
          })
    })

    it('should not update certificate if declaration in denied status', () => {
        cy.login(Cypress.env('keycloakLoginUsername'), Cypress.env('keycloakLoginPassword'))
        cy.denyDeclaration(varDeclarationRef1);

        cy.readFile('cypress/fixtures/update_certificate.xml')
          .then(text => text.replaceAll('$varDeclarationRef', varDeclarationRef1))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                let declarationRefCount = xml.getElementsByTagName('declarationRef').length;

                expect(declarationRefCount).to.eq(1);
                expect(response.body).to.include(varDeclarationRef);
                expect(response.body).to.not.include(varDeclarationRef1);
          })
       })

    it('should not update certificate if declaration in archived status', () => {
        cy.login(Cypress.env('keycloakLoginUsername'), Cypress.env('keycloakLoginPassword'))
        cy.archiveDeclaration(varDeclarationRef2);

        cy.readFile('cypress/fixtures/update_certificate.xml')
          .then(text => text.replaceAll('$varDeclarationRef', varDeclarationRef2))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                let declarationRefCount = xml.getElementsByTagName('declarationRef').length;

                expect(declarationRefCount).to.eq(1);
                expect(response.body).to.include(varDeclarationRef);
                expect(response.body).to.not.include(varDeclarationRef2);
          })
    })
 })