import firebase from 'firebase/app'
import 'firebase/database'
import { getMember } from '../popup-backend'

/**
 * @typedef Database - The Firebase Database service interface
 * @type {object}
 * @property {object} app - The app assoiated with the Database service instance
 * @see https://firebase.google.com/docs/reference/js/firebase.database.Database
 */

/**
 * @typedef Reference - Represents a specific location in your Database and can be used for reading or writing data to that Database location
 * @type {object}
 * @property {?string} key - The last part of the Reference's path (key of a root Reference is null)
 * @property {?object} parent - The parent location of a Reference (parent of a root Reference is null)
 * @property {object} ref - Returns a Reference to the Query's location
 * @property {object} root - The root Reference of the Database
 * @see https://firebase.google.com/docs/reference/js/firebase.database.Reference
 */

/**
 * @typedef DataSnapshot - contains data from a Database location
 * @type {object}
 * @see https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot
 */

/**
 * @typedef Member - a Clubhouse user who is a member of a specified workspace (i.e. usually used in the context of talking about a specific user that belongs to a specific workspace)
 * @type {object}
 * @property {!number} honorRecognitionsRemaining - The amount of times the Member can honor a different Member within the same Workspace (the Member being honored must be different each time)
 * @property {?object.<string, boolean>} honoredBy - Object containing the keys of all users that have honored them
 */

/**
 * @typedef Workspace - A Clubhouse workspace that is being used in our extension
 * @type {object}
 * @property {object.<number, object>} iterationId - The id of the current iteration the Workspace is in
 * @property {object.<string, Member>} iterationId.members - Keys of all the Members that belong to the Workspace
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

const HONOR_AMOUNT_LIMIT = 3

/**
 * The reference to the Database service of our extension
 *
 * @constant {Database}
 */
const DATABASE = firebase.database()

/**
 * The root Reference of our Database
 *
 * @constant {Reference}
 */
const DATABASE_REF = DATABASE.ref()

/**
 * The Reference to all the Workspaces in our Database
 *
 * @constant {Reference}
 */
const WORKSPACES_REF = DATABASE_REF.child('workspaces')

/**
 * The Reference to signed in Member's specific Workspace
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
 * Add additional honors to the id of the honored Member into our database (a Member can only honor an individual Member once)
 *
 * @param {!string} memberId - The id of the (locally stored) Member currently logged in and using our extension
 * @param {!string} honoredMemberId - The id of the Member that the (locally stored) Member currently logged in and using our extension would like to honor (cannot equal memberId)
 */
const honorDatabaseMember = async (memberId, honoredMemberId) => {
  if (memberId !== honoredMemberId) {
    console.log('members are different')
    // update the member and honoredMember at the same time in the database
    const updates = {}

    if (member.honorRecognitionsRemaining !== null &&
      member.honorRecognitionsRemaining > 0) {
      const honoredMemberRef = workspaceRef.child(currentIterationId).child(honoredMemberId)
      await honoredMemberRef.once('value')
        .then(async (dataSnapshot) => {
          // used to check if should update database instead of checking
          // if updates is {}
          let updateDB = false
          const honoredBy = dataSnapshot.val().honored_by
          if (honoredBy === false ||
            !dataSnapshot.child(`honoredBy/${memberId}`).exists()) {
            // member has not honored honoredMember before
            console.log('member is able to honor honoredMember')

            // add member to the list of members that have honored honoredMember
            updates[`${currentIterationId}/${honoredMemberId}/honoredBy/${memberId}`] = true

            // decrement the amount of honor recognitions the member has
            // remaining and update the member's info in the database
            member.honorRecognitionsRemaining--
            updates[`${currentIterationId}/${memberId}/honorRecognitionsRemaining`] = member.honorRecognitionsRemaining

            updateDB = true
          } else {
            // member has honored honoredMember before, do nothing
            console.log('you cannot honor the same member twice during the same iteration')
          }
          console.log('checking if should write to db: ' + updateDB)
          if (updateDB) {
            await workspaceRef.update(updates)
              .then(value => {
                console.log('finished updating db')
              }, reason => { console.log(reason.message) })
          }
        })
    } else {
      // value of member.honorRecognitionsRemaining is 0
      console.log('you are out of honor recognitions. please wait until the next iteration to begin honoring team members again')
    }
  } else {
    console.log('you cannot honor yourself')
  }
}

/**
 * Get the lists of all Members that have honored the corresponding Member
 * for every Member in the Workspace
 *
 * @async
 * @param {string[]} allMemberIds - Array containing the ids of all the members within the workspace
 * @returns {Promise<object.<string, string[]>>} a Promise resolved to an
 * object mapping each member's id to an array of other member ids that have
 * honored them. A member's array will be empty if they have not been honored
 * by other members
 */
const getHonoredByMap = async allMemberIds => {
  const HONORED_BY_MAP = {}

  // check to make sure the workspace is not null
  if (workspaceRef) {
    await workspaceRef.child(currentIterationId).once('value')
      .then(dataSnapshot => {
        if (dataSnapshot.exists()) {
          for (const member of allMemberIds) {
            if (dataSnapshot.child(member).exists()) {
              // get the keys of all the members that have honored this member
              // and add them to the honored by map
              HONORED_BY_MAP[member] = Object.keys(dataSnapshot.child(member).child('honoredBy').val())
            } else {
              console.log(`member "${member}" does not exist inside workspace iteration id ${currentIterationId}`)
            }
          }
        }
      })
  } else {
    console.log('Error. The database has not finished its intialization procedures yet. Please try again later.')
  }
  return HONORED_BY_MAP
}

/**
 * Checks if the member logging in is already within the database and adds them to the database if they are not. Also makes sure to get the Reference to the passed in workspace.
 *
 * @param {!string} memberId - The id of the member whose data we are storing
 * @param {!Array<string>} allMemberIds - Member ids of all members in the workspace
 * @param {!string} workspace - The key identifying the workspace the member is in
 * @param {!number} iterationId - ID of the current iteration
 */
const memberLogin = async (memberId, allMemberIds, workspace, iterationId) => {
  // Init currentIterationId
  currentIterationId = iterationId

  const buildMemberHonoredByObj = () => {
    const dbObj = {}
    allMemberIds.map(id => {
      dbObj[id] = {
        // Use false as a placeholder value for an empty object
        honoredBy: false,
        honorRecognitionsRemaining: HONOR_AMOUNT_LIMIT
      }
    })
    return dbObj
  }

  const workspaceExists = await checkIfExists(WORKSPACES_REF, workspace)
  if (!workspaceExists) {
    // Create the workspace with current iteration and new boss
    // const bossHealth =  Math.floor(Math.random() * 50) + 50;
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
  memberRef.once('value', (dataSnapshot) => {
    if (dataSnapshot.exists()) {
      member.honoredBy = dataSnapshot.val().honored_by
      member.honorRecognitionsRemaining = dataSnapshot.val().honorRecognitionsRemaining
    }
  })
}

/**
 * Retreive information about the team's boss
 *
 * @param {!string} workspace - The key identifying the workspace the member is in
 * @returns {object}
 */
// const getBoss = async (workspace) => {

//   workspaceRef = WORKSPACES_REF.child(workspace)
//   const bossInfo = {}
//   await workspaceRef.once('value')
//     .then((snapshot) => {
//       if (snapshot.child('boss').exists()) {
//         bossInfo.boss = snapshot.val().boss
//       }
//       if (snapshot.child('healthTotal').exists()) {
//         bossInfo.healthTotal = snapshot.val().healthTotal
//       }
//       if (snapshot.child('health').exists()) {
//         bossInfo.health = snapshot.val().health
//       }
//     })
//   console.log(bossInfo)
//   return bossInfo
// }

/**
 *
 *
 * @param {!string} workspace - The key identifying the workspace the member is in
 * @param {!number} damage - The damage (story points) to be done to the boss
 */
// const damageBoss = async (workspace, damage) => {
//   workspaceRef = WORKSPACES_REF.child(workspace)
//   const bossInfo = await getBoss(workspace)
//   // If the damage brings health to below 0 the boss has been defeated
//   if (bossInfo.health - damage < 1) {
//     // Move team to next boss
//     const bossHealth = Math.floor(Math.random() * 50) + 50
//     return await workspaceRef.update({
//       boss: bossInfo.boss + 1,
//       healthTotal: bossHealth,
//       health: bossHealth
//     })
//   } else {
//     // Otherwise deal damage to the current boss
//     return await workspaceRef.update({
//       health: bossInfo.health - damage
//     })
//   }
// }

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

export { memberLogin, honorDatabaseMember, getHonoredByMap, workspaceRef, memberRef }
