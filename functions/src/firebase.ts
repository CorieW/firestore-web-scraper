import * as admin from 'firebase-admin'
import * as events from './events'

let db: admin.firestore.Firestore
let initialized = false

/**
 * Initializes Admin SDK, Firestore, and Eventarc
 */
async function initialize() {
  if (initialized === true) return
  initialized = true
  admin.initializeApp()
  db = admin.firestore()

  /** setup events */
  events.setupEventChannel()
}

export { db, initialize }
