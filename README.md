# Quaranteam-8 Chrome Extension

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/94edb40a997842e993defc1bd247e1db)](https://www.codacy.com/gh/cse112-sp20/Quaranteam-8?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=cse112-sp20/Quaranteam-8&amp;utm_campaign=Badge_Grade)
![Base Pipeline](https://github.com/cse112-sp20/Quaranteam-8/workflows/Base%20Pipeline/badge.svg?branch=develop)
## Getting setup:

1. First clone this repository by entering <code>git clone https://github.com/cse112-sp20/Quaranteam-8.git</code> into terminal
2. If you don't have node installed on your computer, install it from https://nodejs.org/en/download/. Once you have node installed, go to the root of the repository and run <code>npm install</code>

## How to lint:

1. First setup the project using the instructions above
2. Then to lint all js files in <code>src/</code> run the command <code>npm run lint</code>. 
3. If you want to remove the npm errors caused by linting errors, run the command <code>npm run lint -s</code>

## How to run tests:

1. First setup the project using the instructions above
2. Then to run all jest tests in <code>test/</code> run the command <code>npm run test</code>. 
3. If you want to remove the npm errors caused by jest errors, run the command <code>npm run test -s</code>

## How to test extension in Chrome:

1. `npm run build`
2. In Chrome go to URL <code>chrome://extensions</code>
3. Toggle on Developer mode
4. Click Load unpacked
5. Select the dist folder from the repository

## How to clean your build

1. `npm run clean`
