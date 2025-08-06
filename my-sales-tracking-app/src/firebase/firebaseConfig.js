import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "MY_KEY",
    authDomain: "My_project.firebase.com",
    projectId: "sales-tracker-3dc35",
    storageBucket: "Myproject.bucket.com",
    messagingSenderId: "810024677889",
    appId: "1:810024677889:web:1d67c0e03669d7ef69c600"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

if (location.hostname === "localhost") {
    connectAuthEmulator(auth, "https://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("Using FIrestore Emulators");
}

export { auth, db };