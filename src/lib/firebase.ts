import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json' assert { type: 'json' };

// Handle missing keys gracefully
let app;
let db: any = null;
let isFirebaseAvailable = false;

try {
  if (firebaseConfig && firebaseConfig.apiKey) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
    try {
      db = initializeFirestore(app, { ignoreUndefinedProperties: true }, dbId);
    } catch (e) {
      db = getFirestore(app, dbId);
    }
    isFirebaseAvailable = true;
    console.log('Firebase initialized successfully with project ID:', firebaseConfig.projectId);
  } else {
    console.warn('Firebase configuration missing or incomplete. Falling back to local storage.');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export { db, isFirebaseAvailable };
export default app;
