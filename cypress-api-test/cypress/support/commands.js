import "cypress-keycloak-commands";

    Cypress.Commands.add('sendDeclaration', () => {
        cy.readFile('cypress/fixtures/create_declaration.xml')
          .then(text => cy.fetchXML(text))
          .then((response) => {
                let xml = response.body;
                let varDeclarationRef = String(xml).match('<declaration ref="(.*?)">')[1];
                return varDeclarationRef;
          })
    })

    Cypress.Commands.add('archiveDeclaration', (varDeclarationRef) => {
         cy.readFile('cypress/fixtures/archive_declaration.xml')
           .then(text => text.replaceAll('$varDeclarationRef', varDeclarationRef))
           .then(text => cy.fetchXML(text)).then((response) => {
                  expect(response.status).to.eq(200);
                  expect(response.body).to.include('ARCHIVED');
           })
    })

    Cypress.Commands.add('approveDeclaration', (varDeclarationRef) => {
         cy.request({
                     url: 'http://dev.genmed.ut.ee:8010/declarations/' + varDeclarationRef + '/approve',
                     method: 'POST'
         })
         .then((response) => {
             expect(response.status).to.eq(204);
         })
    })

    Cypress.Commands.add('stopDeclaration', (varDeclarationRef) => {
        cy.request({
                    url: 'http://dev.genmed.ut.ee:8010/declarations/' + varDeclarationRef + '/stop',
                    method: 'POST'
        })
        .then((response) => {
            expect(response.status).to.eq(204);
        })
     })

    Cypress.Commands.add('denyDeclaration', (varDeclarationRef) => {
        cy.request({
                    url: 'http://dev.genmed.ut.ee:8010/declarations/' + varDeclarationRef + '/deny',
                    method: 'POST'
        })
        .then((response) => {
            expect(response.status).to.eq(204);
        })
     })

    Cypress.Commands.add('checkCertificate', (validMemberCode) => {
        cy.readFile('cypress/fixtures/check_certificate.xml')
          .then(text => text.replaceAll('$memberCode', validMemberCode))
          .then(text => cy.fetchXML(text))
          .then((response) => {
                const xml = Cypress.$.parseXML(response.body)
                return xml;
          })
     })

    Cypress.Commands.add('getCertificateDates', (afterDateTime, beforeDateTime) => {
        cy.checkCertificate('CYPRESS')
          .then((returned_value) => {
                const xml = returned_value
                let certificateNotAfter = xml.getElementsByTagName('certificate')[0].getAttribute('notAfter');
                let certificateNotBefore = xml.getElementsByTagName('certificate')[0].getAttribute('notBefore');

                expect(certificateNotAfter).to.eq(afterDateTime);
                expect(certificateNotBefore).to.eq(beforeDateTime);
          })
     })

    Cypress.Commands.add('fetchXML', (text) => {
        return cy.request({
            url: 'http://172.17.67.156:8012/xtee',
            method: 'POST',
            body: text,
            headers: {
                'content-type': 'text/xml'
            }
        })
    });

Cypress.Commands.add("login", (user, pass) => {
        Cypress.log({ name: 'Login' })
        const userName = (user != undefined) ? user : Cypress.env('keycloakLoginUsername')
        const passWord = (pass != undefined) ? pass : Cypress.env('keycloakLoginPassword')
        cy.clearCookies()

    const getStartBody = {
        url: 'http://dev.genmed.ut.ee/auth/realms/GenMed/protocol/openid-connect/auth',
        followRedirect: false,
        qs: {
            response_type: 'code',
            approval_prompt: 'auto',
            redirect_uri: 'http://dev.genmed.ut.ee:8010',
            client_id: 'genes-manager'
        }
    }
    cy.request(getStartBody).then((getStartResp) => {
        const actionUrl = getStartResp.body.match(/action\=\"(.*)\" /)[1].replace(/&amp;/g, '&');
        const postLoginBody = {
            method: 'POST',
            url: actionUrl,
            form: true,
            body: { username: userName, password: passWord }
        }
        cy.request(postLoginBody)  // Cookies are set
    })
})