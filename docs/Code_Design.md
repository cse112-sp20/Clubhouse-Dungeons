# Code Design

## Overview
To describe our code design, we will first talk about the desired behavior of our extension, and how that led to the architecture of our project. By understanding the architecture, the purpose of each code file is clear and easy to understand.

## Desired behavior (high-level)
When the user first opens the extension, they see a login page, where they can sign into the extension with their Clubhouse API token. Once logged in, they will see the main popup page of the extension, which shows the iteration that they are in, the boss that they’re fighting, their team’s progress against the boss, the top warriors (contributors) of the iteration, as well as three tabs that display stories, members of their team, and honors given within the team.


## Architecture
By looking at our extension’s desired behavior, we realized that all of the data we needed was already built into (and stored by) Clubhouse, except the honor system. We quickly learned that we would need to create a database to implement the honor system because the honor system data needs to be available across multiple instances of the extension that have no other way of communicating. Choosing Firebase as our database for this was a simple decision because of its affordability, efficiency, and thorough documentation. Initially, we considered the possibility of making our Firebase database a mirror of the Clubhouse database by using Clubhouse webhooks to listen to modifications to the Clubhouse database. The benefits of doing this were that we could structure all the data we needed however we chose (i.e. in a way that is most efficient for querying), and that we could have had all the data we need in one database which would allow our extension to fetch all of the data it needs in one network call (as opposed to more than one call). After more research, we discovered that Clubhouse webhooks must be manually enabled for each Clubhouse workspace, which means that we would’ve had to ask our users to turn on Clubhouse webhooks to use our extension, which we thought was enough of an inconvenience to not depend on Clubhouse webhooks. As an alternative, we decided to make our extension fetch its required Clubhouse data every time it is opened/needed. This means that we don’t store Clubhouse data (i.e. stories) in our Firebase database - our Firebase database only contains data related to the honor system.

When the extension is opened, the login page is shown. In the background, we check if we have cached a Clubhouse API token in browser storage. If there is not an API token in storage, then the extension waits for the user to input one. Once the extension has an API token (either loaded from cache or from user input), the extension makes a network call to the Clubhouse API to check that the API token corresponds to a Clubhouse member. If the API token is valid, we cache the API token - and some other basic Clubhouse information, such as the name of the Clubhouse workspace that the signed-in user is in - and switch to the main popup page of the extension. Otherwise, if the API token is invalid, we stay in the login page. A note about variable scope: once we switch to the main popup page, variables we had references to in the login page are released; the few things (i.e. Clubhouse API token) that we pass from the login page to the main popup page are passed via the cache (Chrome storage).

When the main popup page is switched to, it immediately makes two network calls: (1) fetch Clubhouse data - Clubhouse workspace data, iteration data, and stories data - from the Clubhouse API, and (2) fetch honor system data from our Firebase database.

And that’s it! To keep our code modular, we’ve separated this architecture into different files. Here’s a quick overview of the files:
*   clubhouse-api.js (stateless) contains wrappers of Clubhouse API calls
*   firebase.js (stateful) contains variables and functions related to the Firebase database
*   login.js (stateful) contains UI stuff for the login page, as well as logic for logging in
*   popup.js (stateful) contains UI stuff for the main popup page
*   popup-backend.js (stateful) contains variables and functions related to the Clubhouse-related data used in the extension

Architecture Diagram:

<p align="center">
    <img src="https://github.com/cse112-sp20/Quaranteam-8/blob/develop/docs/images/architecture.jpg" width="80%">
</p>

## login.js
All code pertaining to logging in a user into the extension are located in this file. This file handles either valid a user api key fetched from the chrome browser local storage or validating an inputted Clubhouse API key generated from the member’s team workspace, storing the member information into Chrome Local Storage, and allowing members to click to login once a valid api key has been inputted. 

Imported components:
*   fetchMemberInfoAsync - Fetch info about a member
*   Error Handling Messages
    *   ERR_MSG_INTERNET
    *   ERR_MSG_INVALID_API_TOKEN
    *   ERR_MSG_CLUBHOUSE_API_QUOTA_EXCEEDED
    *   ERR_MSG_BROWSER_STORAGE
    *   ERR_MSG_UNKNOWN_CLUBHOUSE_RESPONSE

On clicking the login button, an onClick handler validates the member and the inputted api key string. validateMember() is called within the onClick and calls the fetchMemberInfoAsync() asynchronous method imported from clubhouse-api.js. This fetchMemberInfoAsync() call returns a promise that fulfills a callback function where the member information is set in chrome local storage. Here the api token, member id, member name, and workspace url slug is saved. The view of the extension is then changed from login.html to popup.html. If the api key is not valid, error handling is performed.

## popup.js
All the code involving the interaction between the backend methods, clubhouse api calls, the firebase database and the popup UI beyond the login page can be found in the popup.js file. In other words, this file determines how our main UI is organized and functions.

As this file will be interacting primarily with the HTML DOM (Document Object Model), we will be seeing quite a few global constants carrying html elements:
*   iterationRange - carries the html element for the text displaying the range of the current iteration.
*   iterationRemaining - carries the html element for the text displaying the remaining time of the current iteration.
*   profileContainer - carries the html element for the UI element that displays the name of the currently logged in user. This element also contains a drop-down menu that allows the user to log out of the extension.
*   memberIcon - carries the html element for the member's clubhouse profile icon

## popup-backend.js
This file holds all functions that utilize clubhouse-api.js functions that return information used in the displayed features which are handled by popup.js. It is in this file where the raw response returned from the Clubhouse API in clubhouse-api.js are stored either in global variables or used within functions that manipulate the data to be usable in the extension. 

It contains the code that is executed once the user has logged into the extension with a valid api token either through Chrome's local storage cache or by user input. The main driver of the file is the anonymous function that defines the setup variable used in popup.js. Within the setup function, a promise is instantiated that sets all global variables (api token, member id, workspace name), calls the imported fetchIterationsAsync which sets the CURRENT_ITERATION to the ‘started’ iteration in Clubhouse, and waits for fetchIterationStoriesAsync and fetchmemberAsync to instantiate the MEMBER_MAP and STORIES global variables. Setup also calculates for each member the total story points they have completed and sets those points to the respective member mapping in MEMBER_MAP. 


Global Variables:
*   API_TOKEN - the api token of the current user
*   WORKSPACE - the workspace name 
*   MEMBER_ID - the user’s clubhouse member id
*   MEMBER_MAP - object mapping of member ids and member information
*   STORIES - array of all stories in the clubhouse workspace
*   CURRENT_ITERATION - the current clubhouse iteration 
*   SETUP - promise to all global variables being initialized


Imported Components:
*   fetchIterationsAsync
*   fetchIterationStoriesAsync
*   fetchMemberAsync
*   completeStoryAsync
*   Error handling messages
    *   ERR_MSG_NO_ACTIVE_ITERATION
    *   ERR_MSG_BROWSER_STORAGE

Information on all components/functions found in popup-backend.js can be found in [API_Documentation](https://github.com/cse112-sp20/Quaranteam-8/wiki/API_Documentation)


## api/clubhouse-api.js
This file contains all the fetching of information through the Clubhouse API. 
All exported components are imports to popup-backend.js. There are no imports to this file.

Functions:
*   fetchFromClubhouse - fetches from a Clubhouse API endpoint that calls through a CORS proxy
*   fetchMemberInfoAsync - fetches information about a member
*   fetchIterationsAsync - fetches iteration information from workspace
*   fetchIterationStoriesAsync - fetches all stories from iteration id
*   fetchMembersAsync - fetches all members in workspace
*   completeStoryAsync - updates story to completed state and updates time completed
*   getCurrentTime - returns current user time


## db/firebase.js
All code required to interact with the extension’s Firebase Realtime Database can be found in the firebase.js file. To learn more about the way that data is stored inside the database, please see ___DatabaseStructure.md____. To learn more about using Firebase’s Realtime Database, please see the ____Firebase_____ section of the Tools Guide.

The database’s main purpose is to support the Clubhouse Dungeons Honor System feature. The goal of the Honor System is to allow users of the extension to be able to see and honor other members of their team in real time. If member A honors member B in Clubhouse Dungeons, then both member A and member B, as well as all members of their team, should see that member B has been honored at the same time. To accomplish this, it was decided that the use of a database was necessary.

firebase.js has several global constants and global variables. The global constants are used to store information that is the same for every user of Clubhouse Dungeons and are denoted by the “@constant” tag as well as being in all caps:
*   DATABASE - the reference to the database service of Clubhouse Dungeons. Without this constant, we would be unable to access our database. This constant is of type [Database](https://firebase.google.com/docs/reference/js/firebase.database.Database)
*   DATABASE_REF - the root reference of our database. This provides us with the path to the root of our database and is the highest level at which we are able to store data in the database. This constant is of type [Reference](https://firebase.google.com/docs/reference/js/firebase.database.Reference)
*   WORKSPACES_REF - the reference to the location where all Clubhouse workspaces are stored inside the database. This provides us with the path to the beginning of the stored information in the database and is the child of DATABASE_REF. All data inside Clubhouse Dungeons is based on the workspaces of Clubhouse members. The workspaces of all users using * Clubhouse Dungeons are children of this constant. This constant is of type [Reference](https://firebase.google.com/docs/reference/js/firebase.database.Reference)

The global variables are used to store information that is relevant to the local signed in user of Clubhouse dungeons. These variables are initialized with values of null and are written using camelCase formatting:

*   workspaceRef - the reference to the signed in member’s specific workspace. This variable provides the path to the location of a single workspace, which is the workspace that the signed in member belongs to. This variable is of type [Reference](https://firebase.google.com/docs/reference/js/firebase.database.Reference) or null
*   currentIterationId - the ID of the current iteration that the member is in. Data relating to the members of a workspace are not stored as the direct children of the workspace itself but rather as the children of its child, which is an iteration ID. Data stored within the database is only relevant for a single iteration, so the data is stored as a child of the ID of the workspace’s current iteration. This variable is of type number or null.
*   memberRef - the reference to the locally stored member inside the database. This provides us with the path to the data of the signed in member. This allows us to more easily update or access data relevant to the signed in member. This variable is of type [Reference](https://firebase.google.com/docs/reference/js/firebase.database.Reference) or null
*   member - the current member using Clubhouse Dungeons that is stored locally. This is a local variable that is kept in sync with the data stored at memberRef inside the database but which allows us to access any relevant data without necessarily having to make a query to the database. This variable is of type _____Member_____, but which has an additional two properties relating to the Honor System, or null

All of the functions inside of firebase.js are asynchronous and have the purpose of accessing data, updating data, or both accessing and updating data inside the database. There are several exported functions as well as a single, unexported, helper function.
Exported functions:
*   memberLogin - This function must be called and must succeed and resolve itself BEFORE any other exported function is invoked! This function is responsible for ensuring that the signed in member’s workspace and all of the members belonging to that workspace exist inside the database. If the workspace does not exist, then this function proceeds to set up this workspace inside the database with all of its members being placed in storage as children of the passed in iteration id with default values. After the workspace has been created or has been confirmed to already exist within the database, the function then checks to see if the passed in iteration id exists as a child of the workspace, and proceeds to initialize it if it does not. The last thing this function does is sync up the locally stored member with the data of the member stored inside the database, according to the passed in member id
*   honorDatabaseMember - This function is responsible for implementing the main functionality of the Clubhouse Dungeons Honor System. This function checks to see if the id of the signed in member and the id of the member that the signed in user wishes to honor are different, ensuring that a user is unable to honor themselves. It then checks to see if the user is able to honor another member by checking to see if the signed in member has exceeded their quota for the amount of honors they are able to give. If all of the checks pass, the function then proceeds to honor the honored member’s id by adding the id of the signed in member to the honored member’s list of other members that have honored them and by decrementing the amount of honors the user has remaining to give
*   getHonoredByMap - This function returns an Object mapping the string of ids of all the members of the signed in member’s workspace to an array of strings containing each member’s list of other members that have honored them

Unexported function:
*   checkIfExists - This is a helper function that takes a node and a key and checks to see if the reference of the key as a child of the node exists inside the database
