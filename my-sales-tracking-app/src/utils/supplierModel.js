import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, Timestamp } from "firebase/firestore";

const supplierCollection = collection(db, "suppliers");

export const addSupplier = async (supplier) => {
    return await addDoc(supplierCollection, {
        ...supplier,
        created: Timestamp.now(),
        modified: Timestamp.now(),
        active: true
    });
};

export const getSuppliers = async () => {
    const snapshot = await getDocs(supplierCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}