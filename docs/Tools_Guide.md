# Tools Guide

## Firebase Realtime Database

One of the core tools used in Clubhouse Dungeons is Google’s Firebase Realtime Database. The process to set up Firebase’s Realtime Database for web applications can be found here. Two of the most important concepts to understand when using Firebase inside of Clubhouse Dungeons are the Firebase Reference and the Firebase DataSnapshot. 

Data is stored in the Firebase Realtime Database as JSON objects, with a structure similar to a cloud-hosted JSON Tree. Objects stored inside the database become nodes of the tree, each with their own keys. The path to the node inside the database is what is known as a Reference. A Reference, to put it simply, gives you a reference to the location of a node within the database. You can access any child nodes in the tree by providing the absolute path to the location of the node, starting from the root Reference of the database, or you could provide a relative path to the node, starting from a Reference that is in the path to the node inside the database. Using ____DatabaseStructure.md____ as an example, in order to get to the location of the node “cKent” in the first iteration, you can use several different methods:
*   Absolute path
    *   firebase.database().ref(“workspaces/dc/iterationId1/cKent”)
    *   firebase.database().ref(“workspaces/dc/iterationId1”).child(“cKent”)
    *   firebase.database().ref(“workspaces/dc”).child(‘iterationId1/cKent”)
    *   firebase.database().ref(“workspaces”).child(“dc”).child(“iterationId1”).child(“cKent”)

*   Relative path
    *   DC_REF = firebase.database().ref(“workspaces/dc”)
        *   C_KENT_REF = DC_REF.child(“iterationId1/cKent”)
        *   C_KENT_REF = DC_REF.child(“iterationId1”).child(“cKent”)
    *   ITERATION_REF = firebase.database().ref(“workspaces/dc/iterationId1”)
        *   C_KENT_REF = ITERATION_REF.child(“cKent”)

These are just a few of the many possible ways to get a reference to the location of the node “cKent”.

Knowing where data is stored inside of a database leads to the next question -- how can I retrieve the data at that location? This is where the DataSnapshot comes into play. A DataSnapshot is an immutable copy of the data stored in a node at a specified Reference location, including all of its children, inside of a database. In order to retrieve a DataSnapshot, you need to provide a Reference to the location of where the data you seek is stored inside the database. Assuming that DC_REF is a reference to the location of the “dc” workspace and C_KENT_REF is a reference to the location of where the node “cKent” is stored inside the first iteration of the “dc” workspace, you can retrieve the data stored at C_KENT_REF in several different ways:
*   To retrieve a DataSnapshot in Clubhouse Dungeons, you should call on() or once() on a database Reference
    *   As a Thenable
        *   DC_REF.once(‘value’).then(dcSnapshot => { const cKentSnapshot = dcSnapshot.child(‘iterationId1’).child(‘cKent’) })
        *   C_KENT_REF.once(‘value’).then(cKentSnapshot => { /* do some stuff */ })
    *   As a Callback
        *   DC_REF.once(‘value’, dcSnapshot => { const cKentSnapshot = dcSnapshot.child(‘iterationId1’).child(‘cKent’) })
        *   C_KENT_REF.once(‘value’, cKentSnapshot => { /* do some stuff */ })

These are just a few of the possible ways to receive a DataSnapshot from the database. 

To gain an even more thorough understanding on the use of Firebase inside of Clubhouse Dungeons, please refer to Firebase [Reference](https://firebase.google.com/docs/reference/js/firebase.database.Reference), Firebase [DataSnapshot](https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot), and to [Add Firebase to your JavaScript project](https://firebase.google.com/docs/web/setup) for more information.


## Webpack & Babel
Webpack is a static module bundler for JavaScript applications — it takes all the code from the application and makes it usable in a web browser. Modules are reusable chunks of code built from your app's JavaScript, node_modules, images, and the CSS styles which are packaged to be easily used in your website. 

Babel is a JavaScript transpiler that converts edge JavaScript into plain old ES5 JavaScript that can run in any browser.

We use Webpack and Babel for configuring the build process that enables the output of the `dist/` folder that is load unpacked into the browser. Check out this reference on creating a [webpack configuration](https://webpack.js.org/configuration/).


## Code Climate & Codacy

After each Git push, Code Climate and Codacy analyzes ourcode for complexity, duplication, and common smells to determine changes in quality and surface technical debt hotspots. For more information on how we use these code quality tools, check out [Code Quality](https://github.com/cse112-sp20/Clubhouse-Dungeons/wiki/Code_Quality)
