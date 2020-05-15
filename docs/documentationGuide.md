# Documentation Guide
### Table of Contents

1.  Tool Overview
2.  JSDoc
3.  Documentation.js
4.  Eslint
5.  Useful Links

## Tool Overview
The tools we use for maintaining our API-level documentation include:
-   JSDoc
-   Documentation.js

### How to install our tools:
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

## Documentation.js
Documentation.js is a documentation generator. It's used to generate documentation from JSDoc formatted comments within your code.

### Command to generate documentation
```npm run documentation```


## Useful Links
1. [JSDoc\.app](https://jsdoc.app/)
2. [Documentation.js](https://github.com/documentationjs/documentation)

