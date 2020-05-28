import firebase from 'firebase/app'
import 'firebase/database'

/**
 * TYPE DECLARATIONS
 *
 * @typedef Database - The Firebase Database service interface
 * @type {Object}
 * @property {Object} app - The app assoiated with the Database service instance
 * @see https://firebase.google.com/docs/reference/js/firebase.database.Database
 *
 *
 * @typedef Reference - Represents a specific location in your Database and can be used for reading or writing data to that Database location
 * @type {Object}
 * @property {?string} key - The last part of the Reference's path (key of a root Reference is null)
 * @property {?Object} parent - The parent location of a Reference (parent of a root Reference is null)
 * @property {Object} ref - Returns a Reference to the Query's location
 * @property {Object} root - The root Reference of the Database
 * @see https://firebase.google.com/docs/reference/js/firebase.database.Reference
 *
 *
 * @typedef DataSnapshot - contains data from a Database location
 * @type {Object}
 * @property {?string} key - The key (last part of the path) of the location of this DataSnapshot
 * @property {Reference} ref - The Reference for the location that generated this DataSnapshot
 * @see https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot
 *
 *
 * @typedef Member - a Clubhouse user who is a member of a specified workspace (i.e. usually used in the context of talking about a specific user that belongs to a specific workspace)
 * @type {Object}
 * @property {!number} honored - Whether the user has been honored by another user who is a member of one of the workspaces they belong to
 * @property {?Object.<string, boolean>} honoredBy - Object containing the keys of all users that have honored them with values of true
 *
 *
 * @typedef Workspace - A Clubhouse workspace that is being used in our extension
 * @type {Object}
 * @property {Object.<string, Member>} members - Keys of all the Members that belong to the Workspace
 * @property {number} iterationLength - The length of the iterations that this Workspace uses
 * @property {string} iterationStart - The start date of the Workspace's current iteration in the format 'Year-Month-DayTHour:Minute:SecondZ'
 * @property {string} iterationEnd - The end date of the Workspace's current iteration in the format 'Year-Month-DayTHour:Minute:SecondZ'
 */

/**
 * Firebase configuration object
 *
 * @type {
      {
        apiKey: string,
        authDomain: string,
        databaseURL: string,
        projectId: string,
        storageBucket: string,
        messagingSenderId: number,
        appId: string,
        measurementId: string
      }
    }
 */
const firebaseConfig = {
  apiKey: 'AIzaSyDm1OKcCR9JjWRN1yxfVmiJfDpjBDIoiw0',
  authDomain: 'quaranteam-08.firebaseapp.com',
  databaseURL: 'https://quaranteam-08.firebaseio.com',
  projectId: 'quaranteam-08',
  storageBucket: 'quaranteam-08.appspot.com',
  messagingSenderId: '136004457227',
  appId: '1:136004457227:web:ab525ecf3dd205aa31480e',
  measurementId: 'G-L74CDLF420'
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

/**
 * The reference to the Database service of our extension
 *
 * @const {Database}
 */
const DATABASE = firebase.database()

/**
 * The root Reference of our Database
 *
 * @const {Reference}
 */
const DATABASE_REF = DATABASE.ref()

/**
 * The Reference to all the Workspaces in our Database
 *
 * @const {Reference}
 */
const WORKSPACES_REF = DATABASE.ref('/workspaces')

/**
 * The Reference to the Workspace of the Member
 *
 * @type {?Reference}
 */
var workspaceRef = null

/**
 * The current Member using our extension that is stored locally
 *
 * @type {?Member}
 */
var member = null

/**
 * The Reference to the locally stored member inside the database
 *
 * @type {?Reference}
 */
var memberRef = null

/**
 * Adds the passed in workspace and all of its members to our database, but
 * only if the workspace is not already in the database
 *
 * @async
 * @param {!string[]} memberIdList - Array of all the Member ids associated with the workspace
 * @param {!string} workspace - The workspace to initialize
 * @param {Object} iteration - Object containing info about the passed in workspace's current iteration
 * @param {string} iteration.start - The date when the iteration was started
 * @param {string} iteration.end - The date when the iteration will end
 * @param {number} iteration.length - The length (in days) of the iteration
 */
const initializeDatabaseWorkspace = async (memberIdList, workspace /*, iteration */) => {
  await checkIfExists(WORKSPACES_REF, workspace)
    .then((exists) => {
      if (exists || memberIdList.length === 0) {
        console.log(`workspace exists: ${exists}; memberIdList size: ${memberIdList.length}; DO NOTHING!!!`)
      } else {
        // The path in our database to the workspace and all its members
        const path = `${WORKSPACES_REF.key}/${workspace}`

        // variable to hold all the updates to send to the database
        var updates = {}
        for (const memberId of memberIdList) {
          updates[`${path}/${memberId}`] = { honored: 0 }
        }

        // Add the Workspace's iteration details
        updates[`${path}/iterationStart`] = 'today' // iteration.start
        updates[`${path}/iterationEnd`] = 'tomorrow' // iteration.end
        updates[`${path}/iterationLength`] = '1' // iteration.length

        // Add the Workspace with all of its Members to the Database
        DATABASE_REF.update(updates)
      }
    })
  // Get the reference to the workspace in the database
  workspaceRef = DATABASE.ref(`${WORKSPACES_REF.key}/${workspace}`)
}

/**
 * Add additional honors to the id of the honored Member into our database
 *
 * @param {!string} memberId - The id of the (locally stored) Member currently logged in and using our extension
 * @param {!string} honoredMemberId - The id of the Member that the (locally stored) Member currently logged in and using our extension would like to honor (cannot equal memberId)
 */
const honorDatabaseMember = (memberId, honoredMemberId) => {
  if (memberId !== honoredMemberId) {
    workspaceRef.once('value')
      .then((DataSnapshot) => {
        // path to the member being honored in the database
        const path = `${WORKSPACES_REF.key}/${workspaceRef.key}/${honoredMemberId}`

        // variable to hold all the updates to send to the database
        var updates = {}
        // update the count for the amount of times that the member being
        // honored has been honored
        updates[`${path}/honored`] = DataSnapshot.child(honoredMemberId).val().honored + 1
        // add the id of the locally stored member to the list of members that
        // have honored the member that is being honored
        updates[`${path}/honoredBy/${memberId}`] = true

        // Update the database
        DATABASE_REF.update(updates)
      })
  }
}

/**
 * Updates the locally stored Member with the info from the database
 *
 * @param {DataSnapshot} snapshot - The data stored inside the database relating to the locally stored Member
 */
const updateLocalMember = (snapshot) => {
  member.honored = snapshot.val().honored
  member.honoredBy = snapshot.val().honoredBy
}

/**
 * Checks if the member logging in is already within the database and adds them to the database if they are not. Also makes sure to get the Reference to the passed in workspace.
 *
 * @param {!string} memberId - The id of the member whose data we are storing
 * @param {!string} workspace - The key identifying the workspace the member is in
 * @param {Object} iteration - Object containing info about the passed in workspace's current iteration
 * @param {string} iteration.start - The date when the iteration was started
 * @param {string} iteration.end - The date when the iteration will end
 * @param {number} iteration.length - The length (in days) of the iteration
 */
const memberLogin = async (memberId, workspace /*, iteration */) => {
  if (workspaceRef === null) {
    alert('workspaceRef is null. make sure to call initializeDatabaseWorkspace')
  }
  checkIfExists(workspaceRef, memberId)
    .then((exists) => {
      if (!exists) {
        // Add member to the database
        DATABASE.ref(`${workspaceRef}/${memberId}`).set({
          honored: 0
        })
      }
      memberRef = DATABASE.ref(`${workspaceRef.key}/${memberId}`)

      // Setup listener that notices whenever the member info in the database
      // is changed
      memberRef.on('value', (dataSnapshot) => {
        // Set the locally stored member to have the values of the member
        // inside the database
        if (dataSnapshot.exists()) {
          updateLocalMember(dataSnapshot)
        }
      })
    })
    .catch((e) => {
      alert(`memberLogin: ${e}`)
    })
}

/**
 * Check to see if the passed in key already exists within the passed in reference
 *
 * @param {Reference} nodeRef - The Reference where the key might exist
 * @param {string} key - The key whose existence we are checking
 * @returns {Promise} A Promise resolve to true if the key already exists, false otherwise
 */
const checkIfExists = async (nodeRef, key) => {
  if (nodeRef === null) {
    console.log('nodeRef is NULL!!!!!')
  }
  var ref = nodeRef.child(key)
  var exists = false
  await ref.once('value')
    .then((snapshot) => {
      if (snapshot.val() === null) {
        /* does not exist */
        exists = false
      } else {
        /* does exist */
        exists = true
      }
    })
  return exists
}

export { memberLogin, initializeDatabaseWorkspace, honorDatabaseMember }
