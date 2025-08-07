import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyBteID6UbtGtFVV-Ye-lhum5ZcV6h8astk",
    authDomain: "sales-tracker-3dc35.firebaseapp.com",
    projectId: "sales-tracker-3dc35",
    storageBucket: "sales-tracker-3dc35.firebasestorage.app",
    messagingSenderId: "810024677889",
    appId: "1:810024677889:web:1d67c0e03669d7ef69c600",
    measurementId: "G-XWZ0TT1E8C"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

if (location.hostname === "localhost") {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true});
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("Using FIrestore Emulators");
}

export { auth, db };