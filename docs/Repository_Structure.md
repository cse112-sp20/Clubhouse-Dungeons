# Repository Structure

## src
Contains all source code for the chrome extension

## test
Contains all source code for testing our project

## docs
Contains all markdown documents that appear in our Github Wiki

## scripts
Contains all source files used by DevOps

## dist
Contains compiled version of the chrome extension that is built when you run `npm run build`

## .github/workflows
Contains all workflows in our pipeline that are run on Github.

## Misc
All other files in the root of the repo are configuration files

# Branch Structure
## Overall Naming Scheme
* All lowercase names
* Separate words with ‘-’

## Examples
* `build/automated-documentation`
* `feature/honor-feed`
* `test/api`

## Master Branch
This is a protected branch that holds the production version of our project.
### Pipelines Run
#### On Pull Request

* Base testing and linting

#### On Push(occurs after Pull Request is Merged)

* Deployment

## Develop

This is a protected branch that holds the most up to date development version of our project.

### Pipelines Run
#### On Pull Request

* Base testing and linting

#### On Push(occurs after Pull Request is Merged)

* Automated Github Wiki Documentation Update


## Feature Branches
Create a feature branch when you want to start working on a new feature.

Naming Scheme:

`feature/<feature being added>`

## DevOps Branches
Create a build branch when you want to improve our pipeline.

Naming Scheme:

`build/<devops feature>`

## QA/Test Branches
Create a test branch when you want to add new tests for a given feature.

Naming Scheme: 

`test/<feature being tested>`

## Bug Branches
Create a bug branch when you want to fix a bug/issue that was found.

Naming Scheme: 

`bug/<feature being fixed>`

## Documentation Branches
Create a doc branch when you want to add a new Markdown file to our Wiki.

Naming Scheme: 

`doc/<thing being documented>`

# Practices
* Pull requests to develop are to be reviewed by **at least 2** people before being merged into develop
* Pull requests to master are to be reviewed by **at least 6** people before being merged into master
* When reviewing a pull request, pull the branch to your local repository and test it in your own browser to confirm functionality before approving.
* When a pull request is merged after being reviewed, **close** the branch that was merged.
