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
 * @typedef User - A Clubhouse user who uses our extension and is in our database
 * @type {Object}
 * @property {string} name - The name of the user
 * @property {Object} workspaces - The workspaces the user belongs to
 * @property {?boolean} honored - Whether the user has been honored by another user who is a member of one of the workspaces they belong to
 * @property {?number} timesHonored - The amount of times the user has been honored by other users
 * @property {?Object} honoredBy - Object containing the keys of all users that have honored them with values of true
 *
 *
 * @typedef Member - a User who is a member of a specified workspace (i.e. usually used in the context of talking about a specific user that belongs to a specific workspace)
 * @type {User}
 *
 *
 * @typedef Workspace - A Clubhouse workspace that is being used in our extension
 * @type {Object}
 * @property {Object} members - Object containing keys of all Members that belong to this workspace with values of true
 * @property {?Object} honoredMembers - Object containing keys of all Members that have been honored and belong to this workspace with values of true
 * @property {number} iterationLength - The length of the iterations that this workspace uses
 * @property {string} iterationStart - The start date of the workspace's current iteration in the format 'Year-Month-DayTHour:Minute:SecondZ'
 * @property {string} iterationEnd - The end date of the workspace's current iteration in the format 'Year-Month-DayTHour:Minute:SecondZ'
 */

/**
* Firebase configuration object
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
const database = firebase.database()

/**
 * The root Reference of our Database
 *
 * @const {Reference}
 */
const databaseRef = database.ref()

/**
 * The Reference to all the workspaces in our Database
 *
 * @const {Reference}
 */
const workspacesRef = database.ref('/workspaces')

/**
 * The Reference to all the users in our Database
 *
 * @const {Reference}
 */
const allUsersRef = database.ref('/allUsers')

/**
 * Update the data within 'workspaces' and 'allUsers' using the data associated
 * with the specified member
 *
 * @param {!string} memberId - The id of the member whose data we are storing
 * @param {string} name - The member's name
 * @param {string} workspaceKey - The key identifying the workspace the member is in
 * @param {?boolean} [workspaceVal=true] - Whether the workspace exists or not
 * @param {?boolean} [honored=null] - True if the user has been honored during this iteration, null otherwise
 * @param {?Oject} [honoredBy=null] - Object containing the ids of other members in the workspace who have honored this member, null if they have not been honored
 * @param {?number} [timesHonored=null] - The number of times the member has been honored during this iteration, null if they have not been honored
 */
const updateUserAndWorkspaceData = (memberId, name, workspaceKey, workspaceVal, honored, honoredBy, timesHonored) => {
  allUsersRef.child(memberId).once('value')
    .then((dataSnapshot) => {
      var updates = {}
      var userRef = allUsersRef.child(memberId)
      var workspaceRef = workspacesRef.child(workspaceKey)
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
        databaseRef.update(updates)
      }
    })
}

/**
 * Updates the data relating to the passed in member of our database, if the
 * member does not yet exist in the database it adds the member to the database
 *
 * @param {!string} memberId - The id of the member whose data we are storing
 * @param {string} name - The member's name
 * @param {string} workspaceKey - The key identifying the workspace the member is in
 * @param {?boolean} [workspaceVal=true] - Whether the workspace exists or not
 * @param {?boolean} [honored=null] - True if the user has been honored during this iteration, null otherwise
 * @param {?Oject} [honoredBy=null] - Object containing the ids of other members in the workspace who have honored this member, null if they have not been honored
 * @param {?number} [timesHonored=null] - The number of times the member has been honored during this iteration, null if they have not been honored
 */
const updateMember = (memberId, name, workspaceKey, workspaceVal, honored, honoredBy, timesHonored) => {
  // alert('in updateMember')
  if (checkIfExists(allUsersRef, memberId)) {
    updateUserAndWorkspaceData(memberId, name, workspaceKey, workspaceVal, honored, honoredBy, timesHonored)
  } else {
    updateUserAndWorkspaceData(memberId, name, workspaceKey, workspaceVal)
  }
}

/**
 * Checks if the member logging in is already within the database and adds them to the database if they are not
 *
 * @param {!string} memberId - The id of the member whose data we are storing
 * @param {!string} name - The member's name
 * @param {!string} workspaceKey - The key identifying the workspace the member is in
 */
const memberLogin = (memberId, name, workspaceKey) => {
  checkIfExists(allUsersRef, memberId)
    .then((bool) => {
      console.log('HERE I AM ' + bool)
      // updateMember(memberId, name, workspaceKey)
    })
}
/**
 * Check to see if the passed in key already exists within the passed in reference
 *
 * @param {Reference} nodeRef - The Reference where the key might exist
 * @param {string} key - The key whose existence we are checking
 * @returns true if the key already exists, false otherwise
 */
const checkIfExists = async (nodeRef, key) => {
  var ref = nodeRef.child(key)
  var bool = false
  await ref.once('value', (snapshot) => {
    // alert('here i am')
    if (snapshot.val() === null) {
      /* does not exist */
      bool = false
    } else {
      /* does exist */
      bool = true
    }
  })
  return bool
}

export { memberLogin }
