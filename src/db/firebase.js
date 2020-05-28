import firebase from 'firebase/app'
import 'firebase/database'
import { getMember } from '../api/api'

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
const WORKSPACES_REF = DATABASE_REF.child('workspaces')

/**
 * The Reference to the Workspace of the Member
 *
 * @type {?Reference}
 */
var workspaceRef = null

/**
 * The ID of the current iteration that the member is in
 *
 * @type {?number}
 */
var currentIterationId = null

/**
* The Reference to the locally stored member inside the database
*
* @type {?Reference}
*/
var memberRef = null

/**
 * The current Member using our extension that is stored locally
 *
 * @type {?Member}
 */
var member = null

/**
 * Add additional honors to the id of the honored Member into our database
 *
 * @param {!string} memberId - The id of the (locally stored) Member currently logged in and using our extension
 * @param {!string} honoredMemberId - The id of the Member that the (locally stored) Member currently logged in and using our extension would like to honor (cannot equal memberId)
 */
const honorDatabaseMember = (memberId, honoredMemberId) => {
  if (memberId !== honoredMemberId) {
    const honoredMemberRef = WORKSPACES_REF.child(currentIterationId).child(honoredMemberId)
    honoredMemberRef.once('value')
      .then(dataSnapshot => {
        const honoredBy = dataSnapshot.val().honored_by
        honoredBy.push(memberId)
        honoredMemberRef.update({ honored_by: honoredBy })
      })
  }
}

/**
 * Checks if the member logging in is already within the database and adds them to the database if they are not. Also makes sure to get the Reference to the passed in workspace.
 *
 * @param {!string} memberId - The id of the member whose data we are storing
 * @param {!string} allMemberIds - Member ids of all members in the workspace
 * @param {!string} workspace - The key identifying the workspace the member is in
 * @param {!number} iterationId - ID of the current iteration
 */
const memberLogin = async (memberId, allMemberIds, workspace /*, iterationId */) => {
  const PLACEHOLDER_ITERATION = 1
  currentIterationId = PLACEHOLDER_ITERATION

  const buildMemberHonoredByObj = () => {
    const dbObj = {}
    allMemberIds.map(id => {
      dbObj[id] = {
        // Use false as a placeholder value for an empty array
        honored_by: false
      }
    })
    return dbObj
  }

  const workspaceExists = await checkIfExists(WORKSPACES_REF, workspace)
  if (!workspaceExists) {
    // Create the workspace and the current iteration
    const workspaceDbObj = {
      [workspace]: {
        [currentIterationId]: buildMemberHonoredByObj()
      }
    }
    await WORKSPACES_REF.update(workspaceDbObj)
  }

  // Init workspaceRef
  workspaceRef = WORKSPACES_REF.child(workspace)

  const currentIterationExists = await checkIfExists(workspaceRef, currentIterationId)
  // If workspace
  if (workspaceExists && !currentIterationExists) {
    // Create the current iteration
    const iterationDbObj = {
      [currentIterationId]: buildMemberHonoredByObj()
    }
    await workspaceRef.update(iterationDbObj)
  }

  // Init memberRef and member
  memberRef = workspaceRef.child(currentIterationId).child(memberId)
  member = getMember(memberId)

  // Set the local member object's honored_by attribute
  memberRef.on('value', (dataSnapshot) => {
    if (dataSnapshot.exists()) {
      member.honoredBy = dataSnapshot.val().honored_by
    }
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
  var exists = null
  await ref.once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        exists = true
      } else {
        exists = false
      }
    })
  return exists
}

export { memberLogin, honorDatabaseMember }
