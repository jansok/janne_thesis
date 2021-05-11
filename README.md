## API tests for GenData application
Present test suite is designed as part of a master's thesis where genetic data information system is discussed.

The purpose of this test suite is to provide an overview of the tests performed and it is **not** executable since \
tests can be executed only in safe software development environment which currently is **not** accessible to the public.

### Prerequisites:
- NodeJS and NPM
- Cypress

### Folder structure and descriptions:

- cypress.json: configuration file
- package.json: holds libraries, metadata and information about dependencies
- cypress/integration: contains all test files
- cypress/fixtures: used to store test data
- cypress/support: support folder with reusable codes
- cypress/screenshots: automatically captured screenshots when test fails
- cypress/videos: automatically recorded videos of each test file

### Running the tests:

- Without UI:
```
npm test
```
- With UI:
```
npm run cypress:open
```