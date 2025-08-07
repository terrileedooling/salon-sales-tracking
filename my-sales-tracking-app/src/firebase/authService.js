import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";

export const logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout failed:", error);
    }
};