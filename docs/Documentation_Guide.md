# Documentation Guide
### Table of Contents

1.  Tool Overview
2.  JSDoc
3.  jsdoc-to-markdown
4.  Eslint
5.  Useful Links

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
