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
 * @property {string | null} key - The last part of the Reference's path (key of a root Reference is null)
 * @property {Object | null} parent - The parent location of a Reference (parent of a root Reference is null)
 * @property {Object} ref - Returns a Reference to the Query's location
 * @property {Object} root - The root Reference of the Database
 * @see https://firebase.google.com/docs/reference/js/firebase.database.Reference
 *
 *
 * @typedef DataSnapshot - contains data from a Database location
 * @type {Object}
 * @property {string | null} key - The key (last part of the path) of the location of this DataSnapshot
 * @property {Reference} ref - The Reference for the location that generated this DataSnapshot
 * @see https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot
 *
 *
 * @typedef Member - a Clubhouse user who is a member of a specified workspace (i.e. usually used in the context of talking about a specific user that belongs to a specific workspace)
 * @type {Object}
 * @property {number} honored - Whether the user has been honored by another user who is a member of one of the workspaces they belong to
 * @property {Object | null} honoredBy - Object containing the keys of all users that have honored them with values of true
 *
 *
 * @typedef Workspace - A Clubhouse workspace that is being used in our extension
 * @type {Object}
 * @property {Member} members - Keys of all the Members that belong to the Workspace
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
 * Updates the data relating to the passed in member of our database, if the
 * member does not yet exist in the database it adds the member to the database
 *
 * @param {!string} memberId - The id of the member whose data we are storing
 * @param {!string} workspace - The Workspace the member is in
 * @param {?number} [honored=0] - The number of times the member has been honored during this iteration
 * @param {?Oject} [honoredBy=null] - Object containing the ids of other members in the workspace who have honored this member, null if they have not been honored
 */
/*
const updateUserAndWorkspaceData = (memberId, name, workspaceKey, workspaceVal, honored, honoredBy, timesHonored) => {
  allUsersRef.child(memberId).once('value')
    .then((dataSnapshot) => {
      var updates = {}
      var userRef = allUsersRef.child(memberId)
      var workspaceRef = WORKSPACES_REF.child(workspaceKey)
      // check if any values in the database differ from the parameters
      if (dataSnapshot.child('name').val() !== name) {
        updates[`${userRef}/name`] = name
      }
      if (dataSnapshot.child(`workspaces/${workspaceKey}`).val() !== workspaceVal) {
        // update user data
        updates[`${userRef}/workspaces/${workspaceKey}`] = workspaceVal
        // update workspace data
        updates[`${workspaceRef}/members/${memberId}`] = workspaceVal
      }
      if (dataSnapshot.child('honored').val() !== honored) {
        // update user data
        updates[`${userRef}/honored`] = honored
        // update workspace data
        updates[`${workspaceRef}/honoredMembers/${memberId}`] = honored
      }
      if (dataSnapshot.child('honoredBy').val() !== honoredBy) {
        updates[`${userRef}/honoredBy`] = honoredBy
      }
      if (dataSnapshot.child('timesHonored').val() !== timesHonored) {
        updates[`${userRef}/timesHonored`] = timesHonored
      }
      if (Object.keys(updates).length !== 0) {
        // update the database
        DATABASE_REF.update(updates)
      }
    })
}
*/

/**
 * Updates the locally stored Member with the info from the database
 *
 * @param {DataSnapshot} snapshot - The data stored inside the database relating to the locally stored Member
 */
const updateLocalMember = (snapshot) => {
  member.honored = snapshot.child('honored').val()
  member.honoredBy = snapshot.child('honoredBy').val()
}

/**
 * Checks if the member logging in is already within the database and adds them to the database if they are not. Also makes sure to get the Reference to the passed in workspace.
 *
 * @param {!string} memberId - The id of the member whose data we are storing
 * @param {!string} workspace - The key identifying the workspace the member is in
 * @param {Object} iteration - Object containing info about the passed in workspace's current iteration
 * @property {string} iteration.start - The date when the iteration was started
 * @property {string} iteration.end - The date when the iteration will end
 * @property {number} iteration.length - The length (in days) of the iteration
 */
const memberLogin = async (memberId, workspace /*, iteration */) => {
  setupWorkspace(memberId, workspace /*, iteration */)
  if (workspaceRef === null) {
    console.log('workspaceRef is NULL!!!!!')
  }
  checkIfExists(workspaceRef, memberId)
    .then((exists) => {
      if (!exists) {
        member = {
          honored: 0
        }
        // Add member to the database
        DATABASE.ref(`${workspaceRef}/${memberId}`).set({
          honored: 0
        })
      }
      memberRef = DATABASE.ref(`${workspaceRef.key}/${memberId}`)

      // Setup listener that notices whenever the member info in the database
      // is changed
      memberRef.on('value', (dataSnapshot) => {
        // update the locally stored member with the changed values from the database
        if (dataSnapshot.exists()) {
          updateLocalMember(dataSnapshot)
        }
      })
    })
    .catch((e) => {
      // alert(`memberLogin: ${e}`)
    })
}

/**
 * Checks to see if the workspace already exists in the database and sets up a Reference to the passed in workspace. If the workspace does not exist in the database, then it adds the workspace to the database.
 *
 * @param {!string} memberId - The id of the member whose data we are storing
 * @param {!string} workspace - The key identifying the workspace the member is in
 * @param {Object} iteration - Object containing info about the passed in workspace's current iteration
 * @property {string} iteration.start - The date when the iteration was started
 * @property {string} iteration.end - The date when the iteration will end
 * @property {number} iteration.length - The length (in days) of the iteration
 */
const setupWorkspace = (memberId, workspace /*, iteration */) => {
  if (WORKSPACES_REF === null) {
    console.log('WORKSPACES_REF is NULL!!!!!')
  }
  checkIfExists(WORKSPACES_REF, workspace)
    .then((exists) => {
      // Add the workspace to the database if it is not already there
      if (!exists) {
        DATABASE.ref(`${WORKSPACES_REF.key}/${workspace}`).set({
          [memberId]: {
            honored: 0
          },
          iterationStart: 'today',
          iterationEnd: 'tomorrow',
          iterationLength: 'one'
        })
      }
    })
    .catch((e) => {
      alert(`setupWorkspace: ${e}`)
    })
    // Get the reference to the workspace in the database
  workspaceRef = DATABASE.ref(`${WORKSPACES_REF.key}/${workspace}`)
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
  await ref.once('value', (snapshot) => {
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

export { memberLogin }
