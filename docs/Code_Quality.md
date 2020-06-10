# Code Quality & Test Coverage
Codacy and Code Climate are used to automate code reviewing and track issues from pull requests in order to minimize the project’s technical debt. 
Both have been configured to match the style guidelines we defined in eslint.

### Test Coverage
To generate test coverage run the command `npm run test:coverage`

This outputs multiple formats of the test coverage including:
*   Console Output shown when you run the command
*   Website found in `coverage/lcov-report` which can be viewed by opening `coverage/lcov-report/index.html` in Chrome
*   xml found at `coverage/clover.xml` which is used by Codeclimate and Codacy
*   json found at `coverage/coverage-final.json`

You can use whichever format best suits your setup.

## Codacy
Codacy is an easy to setup service that provides automated code quality reviews and can intergrate with Github.

### Integration
Our team attempted to include Codacy in our pull request checks but were unable to get it work due to an unsupported Eslint plugin that we were using to check jsdoc comments.

## CodeClimate
CodeClimate provides automated code review for test coverage and maintainability.

### Integration
Our team included CodeClimate in our checks for all our pull requests.
This means that each time a pull request is created, CodeClimate analyzes the branch and if there is an issue it failes the check until the issue is approved.

## Access
All admins of the repository have admin access to view both Codacy and CodeClimate.

## Links
*   [Codacy](https://app.codacy.com/gh/cse112-sp20/Quaranteam-8/dashboard)
*   [CodeClimate](https://codeclimate.com/github/cse112-sp20/Quaranteam-8)