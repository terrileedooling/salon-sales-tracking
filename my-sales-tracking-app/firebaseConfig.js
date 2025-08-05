import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "MY_KEY",
    authDomain: "My_project.firebase.com",
    projectId: "my_project_id",
    storageBucket: "Myproject.bucket.com",
    messagingSenderId: "My_sender_id",
    appId: "My_app_id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };