import firebase from 'firebase/app'
import 'firebase/database'

/**
 * TYPE DECLARATIONS
 *
 * @typedef Database
 * @type {Object}
 * @property {Object} app - The app assoiated with the Database service instance
 * @see https://firebase.google.com/docs/reference/js/firebase.database.Database
 *
 *
 * @typedef Reference
 * @type {Object}
 * @property {string | null} key - The last part of the Reference's path (key of a root Reference is null)
 * @property {Object | null} parent - The parent location of a Reference (parent of a root Reference is null)
 * @property {Object} ref - Returns a Reference to the Query's location
 * @property {Object} root - The root Reference of the Database
 * @see https://firebase.google.com/docs/reference/js/firebase.database.Reference
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
const workspacesRef = database.ref('/organizations')

/**
 * The Reference to all the users in our Database
 *
 * @const {Reference}
 */
const allUsersRef = database.ref('/allUsers')

/**
 * The Reference to the workspace associated with the user's api token
 */
var workspaceRef = null

/**
 * (Over)write the user's data to our extension's database
 *
 * @param {string} userId - the id of the user whose data we are storing
 * @param {string} name - the user's name
 * @param {boolean} [honored=false] - true if the user has been honored during this iteration, false otherwise
 * @param {number} [timesHonored=0] - the number of times the user has been honored during this iteration
 */
const writeUserData = (userId, name, honored, timesHonored) => {
  database.ref(`users/${userId}`).set({
    username: name,
    honored: honored,
    timesHonored: timesHonored
  },
  /* callback function */
  (error) => {
    if (error) {
      console.error(`writeUserData failed: ${error.message}`)
    } else {
      console.log('successfully wrote user data to database')
    }
  })
}

const turnOffListeners = () => {
  // called when user signs out
}

const addMember = (memberId, name, workspace, honored, timesHonored) => {
  var member = {
    [memberId]: {
      name: name,
      workspace: workspace,
      honored: honored,
      timesHonored: timesHonored
    }
  }
  if (checkIfExists(allUsersRef, memberId)) {
    allUsersRef.child(memberId).once('value')
      .then((dataSnapshot) => {
        // check if values changed
        if (!dataSnapshot.child('honored').val()) {

        } else {
          
        }
      })
  }
}

/**
 * Check to see if the passed in key already exists within the passed in reference
 *
 * @param {Reference} nodeRef - The Reference where the key might exist
 * @param {string} key - The key whose existence we are checking
 * @returns true if the key already exists, false otherwise
 */
const checkIfExists = (nodeRef, key) => {
  var ref = nodeRef.child(key)

  ref.once('value', (snapshot) => {
    if (snapshot === null) {
      /* does not exist */
      return false
    } else {
      /* does exist */
      return true
    }
  })
}

export { writeUserData, addMember, turnOffListeners }
