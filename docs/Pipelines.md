# Pipeline Basics
## Overview 
Our pipeline comprises of 2 parts:
*   the local version used by developers to work on the project
*   the remote version that ensures new code that is added to the develop branch is up to our teams standard.

## Local Pipeline
Local Pipelines are run using npm scripts. The entire pipeline is run by using the command `npm run all`.

### Options:
| Command                  | Description                                                                                                      |
|--------------------------|------------------------------------------------------------------------------------------------------------------|
| `npm run all`            | Runs all commands above                                                                                          |
| `npm run build`          | Builds the chrome extension using the files in the `src/` directory and outputs the files into `dist/` directory |
| `npm run lint`           | Runs Eslint on all js files in the `src/` and `test/` directories                                                |
| `npm run test`           | Runs Jest on all test files in the `test/` directory                                                             |
| `npm run test:coverage`  | Runs Jest on all test files in the `test/` directory and outputs the test coverage reports into `coverage/`      |
| `npm run docs:build:test`| Generates api documentation from jsdoc comments and outputs it into the `docs/API_Documentation.md`              |
| `npm run docs:build:api` | Generates test documentation from jsdoc comments and outputs it into the `docs/Test_Documentation.md`            |
| `npm run clean`          | Deletes the `dist/` and `coverage/` directories if they are found                                                |

## Remote Workflows
Remote Pipelines are run using Github Actions which work similar to other CI platforms in that it functions via yml configuration files.
![Basic Pipeline Diagram](https://github.com/cse112-sp20/Quaranteam-8/tree/develop/docs/images/diagram.png "Basic Pipeline Diagram")
The overview of our pipeline is shown in the diagram above. Since our develop and master branches are protected all new code must first be pushed to Github and then a pull request needs to be created. Once created the base pipeline executes which builds our extension, runs our Linter, then runs our Unit tests, and finally CodeClimate Analyzes the branch and checks for new issues.

If all these pass and the pull request is merged into develop then our next workflow starts which generates coverage reports to send to Codacy and CodeClimate and also generates jsdoc based documentation and uploads it to our GitHub Wiki.

If all these pass and the pull request is merged into master then our next workflow starts which builds the chrome extension, zips it, and then uploads it to the Chrome Webstore.

For a more indepth view of the entire process refer to [this](https://miro.com/app/board/o9J_ktv_lIA=/).

To update/edit this diagram request access which will be reviewed.

### Github Actions Overview
Each Workflow is represented by a single file that can contain multiple jobs to be run and each job is described by a series of steps.
Each workflow must have a name, a trigger event, and at least 1 job.
Each job must have a name, specify the OS it runs on, and a series of steps

Since we are using Node.js as our package manager the core of our remote pipelines are the npm scripts we use in our Local Pipeline.

All our workflow configuration files can be found at `github/workflows` in our repository.

#### Evironment Variables
Some Github Actions require secret keys such as API keys which shouldn't be made public. Github enables you to setup environment variables by going to the Secrets page which is found in settings([here](https://github.com/cse112-sp20/Quaranteam-8/settings/secrets)). These values can be accessed in github action workflows by using `${{ secrets.<secret_name> }}` where `<secret_name>` is the name you set when creating the secret.

Our repository has a total of 3 workflows that run at varying times.

### Base Pipeline
This Workflow executes on pull requests into the develop and master branch.
This workflow can be found at `github/workflows/base.yml`.

#### Jobs:
1.   Linting all js files in `src/` and `test/` using Eslint
2.   Run all our tests using Jest

### Deployment Pipeline
This Workflow executes on pushes to master branch which occurs each time a pull request is merged into master.
This workflow can be found at `github/workflows/deploy.yml`.

#### Jobs:
1.   Build Extension, Zip it up, and upload to the Chrome Web Store

### Documentation and Code Coverage Report Pipeline
This Workflow executes on pushes to the develop branch which occurs each time a pull request is merged into develop.
This workflow can be found at `github/workflows/doc.yml`.

For more details about documentation refer to the [Documentation_Guide](https://github.com/cse112-sp20/Quaranteam-8/wiki/Documentation_Guide).
#### Jobs:
1.   Generating Documentation and Uploading to our Github Wiki
2.   Generating Code Coverage Reports and uploading them to Codacy and CodeClimate
