# Clubhouse Dungeons
By Quaranteam-8

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/94edb40a997842e993defc1bd247e1db)](https://www.codacy.com/gh/cse112-sp20/Quaranteam-8?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=cse112-sp20/Quaranteam-8&amp;utm_campaign=Badge_Grade) [![Codacy Badge](https://app.codacy.com/project/badge/Coverage/94edb40a997842e993defc1bd247e1db)](https://www.codacy.com/gh/cse112-sp20/Quaranteam-8?utm_source=github.com&utm_medium=referral&utm_content=cse112-sp20/Quaranteam-8&utm_campaign=Badge_Coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/e3bdb7ab134bd2fc4eef/maintainability)](https://codeclimate.com/github/cse112-sp20/Quaranteam-8/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/e3bdb7ab134bd2fc4eef/test_coverage)](https://codeclimate.com/github/cse112-sp20/Quaranteam-8/test_coverage)
![Base Pipeline](https://github.com/cse112-sp20/Quaranteam-8/workflows/Base%20Pipeline/badge.svg?branch=develop)
## Getting setup

1.  First clone this repository by entering <code>git clone https://github.com/cse112-sp20/Quaranteam-8.git</code> into terminal
2.  If you don't have node installed on your computer, install it from https://nodejs.org/en/download/.
3.  Once you have node installed, go to the root of the repository and run <code>npm install</code>

## Basic Commands
| Command               | Description                                                                                                      |
|-----------------------|------------------------------------------------------------------------------------------------------------------|
| `npm run build`       | Builds the chrome extension using the files in the `src/` directory and outputs the files into `dist/` directory |
| `npm run lint`        | Runs Eslint on all js files in the `src/` and `test/` directories                                                |
| `npm run test`        | Runs Jest on all test files in the `test/` directory                                                             |
| `npm run docs:build`  | Generates documentation from jsdoc comments and outputs them into the `docs/` directory                          |
| `npm run all`         | Runs all commands above                                                                                          |
| `npm run clean`       | Deletes the `dist/` and `coverage/` directories if they are found                                                |

## For More Info Checkout Our [Wiki](https://github.com/cse112-sp20/Quaranteam-8/wiki)