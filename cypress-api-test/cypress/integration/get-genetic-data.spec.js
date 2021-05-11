describe('Getting genetic data', () => {
    let declarationRef = 'e6b4ec08-101e-46f0-963e-b22b4ee0479a';
    let varDataRef = '';
    let personCode = '10000000000';

    it('should return genetic data reference', () => {
        cy.readFile('cypress/fixtures/get_genetic_data_reference.xml')
          .then(text => text.replaceAll('$declarationRef', declarationRef))
          .then(text => text.replaceAll('$personCode', personCode))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                Cypress.$(xml).each(function() {
                    varDataRef = Cypress.$(this).find('dataRef').text()
                    expect(Cypress.$(this).find('declarationRef').text()).to.eq(declarationRef);
                    expect(Cypress.$(this).find('status').text()).to.eq('OK');
                })
          })
    })

    it('should return genetic data', () => {
        let returnedDeclarationRef = '';
        let returnedDataRef = '';
        let dataStatus = '';
        let iv = '';
        let encryptedKey = '';
        let data = '';

        cy.readFile('cypress/fixtures/get_genetic_data.xml')
          .then(text => text.replaceAll('$declarationRef', declarationRef))
          .then(text => text.replaceAll('$varDataRef', varDataRef))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                Cypress.$(xml).each(function() {
                    returnedDeclarationRef = Cypress.$(this).find('declarationRef').text()
                    returnedDataRef = Cypress.$(this).find('dataRef').text()
                    dataStatus = Cypress.$(this).find('status').text()
                    iv = Cypress.$(this).find('encryption>algorithm>iv').text()
                    encryptedKey = Cypress.$(this).find('encryption>encryptedKey').text()
                    data = Cypress.$(this).find('data').text()
                })
                let algorithmMode = xml.getElementsByTagName('algorithm')[0].getAttribute('mode');
                let algorithmName = xml.getElementsByTagName('algorithm')[0].getAttribute('name');
                let algorithmTagLength = xml.getElementsByTagName('algorithm')[0].getAttribute('tagLength');
                let certificateSerial = xml.getElementsByTagName('certificate')[0].getAttribute('serial');

                expect(response.status).to.eq(200);
                expect(returnedDeclarationRef).to.eq(declarationRef);
                expect(returnedDataRef).to.eq(varDataRef);
                expect(dataStatus).to.eq('OK');
                expect(iv).to.not.eq(null);
                expect(iv).to.not.be.null;
                expect(encryptedKey).to.not.be.null;
                expect(data).to.not.be.null;
                expect(algorithmMode).to.eq('GCM');
                expect(algorithmName).to.eq('AES');
                expect(algorithmTagLength).to.eq('128');
                expect(certificateSerial).to.not.be.null;
          })
    })

    it('should not return genetic data when already returned', () => {
        cy.readFile('cypress/fixtures/get_genetic_data.xml')
          .then(text => text.replaceAll('$declarationRef', declarationRef))
          .then(text => text.replaceAll('$varDataRef', varDataRef))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.include('RESULT_DOWNLOADED');
                expect(response.body).to.include('The data has been downloaded once and cannot be downloaded again.');
          })
    })

    it('should not return genetic data reference when non-existent declaration reference', () => {
        cy.readFile('cypress/fixtures/get_genetic_data_reference.xml')
          .then(text => text.replaceAll('$declarationRef', '00000000-abcd-123b-456c-123a456b789'))
          .then(text => text.replaceAll('$personCode', personCode))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.not.include('<dataRef>' + varDataRef + '</dataRef>');
                expect(response.body).to.include('DECLARATION_NOT_FOUND');
                expect(response.body).to.include('Data-usage declaration was not found, or it is not in APPROVED state.');
        })
    })

    it('should not return genetic data reference when invalid person code', () => {
        cy.readFile('cypress/fixtures/get_genetic_data_reference.xml')
         .then(text => text.replaceAll('$declarationRef', declarationRef))
         .then(text => text.replaceAll('$personCode', '0000'))
         .then(text => cy.fetchXML(text))
         .then((response) => {
               expect(response.status).to.eq(200);
               expect(response.body).to.not.include('<dataRef>' + varDataRef + '</dataRef>');
               expect(response.body).to.include('NO_MATCHING_DATA');
       })
    })

    it('should not return genetic data when non-existent declaration reference', () => {
        cy.readFile('cypress/fixtures/get_genetic_data.xml')
          .then(text => text.replaceAll('$declarationRef', '00000000-abcd-123b-456c-123a456b789'))
          .then(text => text.replaceAll('$varDataRef', varDataRef))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.include('DECLARATION_NOT_FOUND');
                expect(response.body).to.include('Data-usage declaration was not found, or it is not in APPROVED state.');
        })
   })

    it('should not return genetic data when non-existent genetic data reference', () => {
        cy.readFile('cypress/fixtures/get_genetic_data.xml')
          .then(text => text.replaceAll('$declarationRef', declarationRef))
          .then(text => text.replaceAll('$varDataRef', '00000000-abcd-123b-456c-123a456b789'))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.include('RESULT_NOT_FOUND');
                expect(response.body).to.include('The referred genetic data ([dataRef]) was not found.');
          })
    })
 })