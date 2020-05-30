# Documentation Guide

### Table of Contents

1.  Overview
2.  Markdown
3.  Tool Overview
2.  JSDoc
3.  jsdoc-to-markdown
4.  Eslint
5.  Useful Links

## Overview
All documentation can be found in our Github Wiki. The source files of all our projects documentation can be found in the docs folder of our repository excluding API documentation which is generated dynamically. Each time we approve and merge any code into develop, all documentation is uploaded to our Github Wiki.

## Markdown
Since we are using Github Wiki to hold our documentation, we are using Markdown format. Markdown is a lightweight markup language with plain-text-formatting syntax. Refer to the references for more details.

### Naming Scheme
When creating documents in the `docs/` directory, name the files by capitalizing the first letter in each word and using `_` to separate words.

Example: `Testing_Guide.md`

### How to Add New Documentation to the Project
1.  Create a new branch off of develop with the name `docs/<nam>`
2.  Create the new markdown(`.md`) file in `docs/` directory
3.  Create pull request to merge your branch into develop
4.  Once the pull request is approved and merged, your new document should appear in the Github Wiki

### Reference
-   [Github Markdown Reference](https://help.github.com/en/github/writing-on-github/basic-writing-and-formatting-syntax)

## Tool Overview
The tools we use for maintaining our API-level documentation include:
-   JSDoc
-   jsdoc-to-markdown

### How to install our tools
After cloning our repository, run the command:
`npm install`

## JSDoc
JSDoc provides us with a standardized way of writing comments in our code to describe functions, classes, methods, and variables. Once our code is commented, it also provides a way to generate documentation by parsing our comments.

### JSDoc Function Example
```
/**
 * This is a function.
 *
 * @param {string} n - A string param
 * @return {string} A good string
 *
 * @example
 * // returns 'hello'
 *     foo('hello')
 */

function foo(n) { return n }
```
### JSDoc Types
```
@param {string=} n              Optional
@param {string} [n]             Optional
@param {(string|number)} n  	Multiple types
@param {*} n	                Any type
@param {...string} n	        Repeatable arguments
@param {string} [n="hi"]        Optional with default
@param {string[]} n             Array of strings
@return {Promise<string[]>} n	Promise fulfilled by array of strings
```
### JSDoc typedef
```/**
 * A song
 * @typedef {Object} Song
 * @property {string} title - The title
 * @property {string} artist - The artist
 * @property {number} year - The year
 */
/**
 * Plays a song
 * @param {Song} song - The {@link Song} to be played
 */

function play (song) {
}
```
### JSDoc Other Useful Tags
```
@param {<type>} <variable name> - <description>
@return {<type>} <description>
@constructor
@async
@module <name>
```

## jsdoc-to-markdown
jsdoc-to-markdown generates markdown API documentation based on jsdoc annotated source code.

### Command to generate documentation
```npm run docs:build```

## Eslint
ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code, with the goal of making code more consistent and avoiding bugs.

### Linting Rules
1. JSDoc Comments
2. [JS Standard Style guide](https://standardjs.com/rules-en.html)

### Command to run Eslint
To have the linter run automated fixes and report errors use the command:
```npm run lint```
You should do this before commiting any changes to keep our repositories log clean of any commits that just fix linting errors.

## Useful Links
1. [JSDoc\.app](https://jsdoc.app/)
2. [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown)
3. [JS Standard Style guide](https://standardjs.com/rules-en.html)
4. [Eslint](https://eslint.org/)
