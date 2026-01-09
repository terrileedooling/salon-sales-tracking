import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators ONLY in development
if (process.env.NODE_ENV === 'development') {
  console.log('Connecting to Firebase Emulators...');
  
  // Connect to Auth Emulator (default port 9099)
  connectAuthEmulator(auth, 'http://localhost:9099');
  
  // Connect to Firestore Emulator (default port 8080)
  connectFirestoreEmulator(db, 'localhost', 8080);
}

export { auth, db };