import firebase from 'firebase/app'
import 'firebase/database'

/**
 * TYPE DECLARATIONS
 *
 * @typedef Database
 * @type {Object}
 * @property {Object} app The app assoiated with the Database service instance
 * @see https://firebase.google.com/docs/reference/js/firebase.database.Database
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

export { writeUserData }
