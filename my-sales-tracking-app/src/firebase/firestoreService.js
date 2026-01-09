import { 
    collection, 
    query, 
    where, 
    getDocs, 
    getDoc,
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    serverTimestamp,
    orderBy,
    limit,
    startAfter,
    Timestamp
  } from 'firebase/firestore';
  import { db } from './firebaseConfig';
  import { getAuth } from 'firebase/auth';
  
  export const firestoreService = {
    // Get collection with filters
    // getCollection: async (collectionName, filters = {}, pagination = {}) => {
    //   const auth = getAuth();
    //   const uid = auth.currentUser?.uid;
    
    //   if (!uid) throw new Error("User not authenticated");
    
    //   let q = query(
    //     collection(db, collectionName),
    //     where('userId', '==', uid)
    //     // orderBy('createdAt', 'desc') // Commented out
    //   );
    
    //   Object.entries(filters).forEach(([key, value]) => {
    //     if (value !== undefined && value !== '') {
    //       q = query(q, where(key, '==', value));
    //     }
    //   });
    
    //   if (pagination.limit) q = query(q, limit(pagination.limit));
    //   if (pagination.startAfter) q = query(q, startAfter(pagination.startAfter));
    
    //   const snapshot = await getDocs(q);
    
    //   return snapshot.docs.map(d => ({
    //     id: d.id,
    //     ...d.data(),
    //     createdAt: d.data().createdAt?.toDate?.() ?? null,
    //     updatedAt: d.data().updatedAt?.toDate?.() ?? null
    //   }));
    // },

    getCollection: async (collectionName, filters = {}, pagination = {}) => {
      const auth = getAuth();
      const uid = auth.currentUser?.uid;
      
      console.log('DEBUG: User UID:', uid);
      console.log('DEBUG: Collection:', collectionName);
      
      if (!uid) {
        console.error("User not authenticated");
        throw new Error("User not authenticated");
      }
      
      try {
        // SIMPLIFY the query to test
        let q = query(
          collection(db, collectionName),
          where('userId', '==', uid)
          // REMOVE orderBy temporarily
          // orderBy('createdAt', 'desc')
        );
        
        console.log('DEBUG: Query constructed');
        
        const snapshot = await getDocs(q);
        console.log('DEBUG: Got snapshot with', snapshot.docs.length, 'docs');
        
        return snapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() ?? null,
          updatedAt: d.data().updatedAt?.toDate?.() ?? null
        }));
      } catch (error) {
        console.error('DEBUG: Full error:', error);
        console.error('DEBUG: Error code:', error.code);
        console.error('DEBUG: Error message:', error.message);
        throw error;
      }
    },
  
    // Get single document
    getDocument: async (collectionName, docId) => {
      try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          return { 
            id: docSnap.id, 
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate?.() || null,
            updatedAt: docSnap.data().updatedAt?.toDate?.() || null
          };
        } else {
          throw new Error("Document not found");
        }
      } catch (error) {
        console.error("Error getting document:", error);
        throw error;
      }
    },
  
    addDocument: async (collectionName, data) => {
      const auth = getAuth();
      const uid = auth.currentUser?.uid;
    
      if (!uid) throw new Error("User not authenticated");
    
      const docData = {
        ...data,
        userId: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
    
      return await addDoc(collection(db, collectionName), docData);
    },
    
  
    // Update document
    updateDocument: async (collectionName, docId, data) => {
      try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
        return { id: docId, ...data };
      } catch (error) {
        console.error("Error updating document:", error);
        throw error;
      }
    },
  
    // Delete document
    deleteDocument: async (collectionName, docId) => {
      try {
        await deleteDoc(doc(db, collectionName, docId));
      } catch (error) {
        console.error("Error deleting document:", error);
        throw error;
      }
    },
  
    // Get totals
    getTotals: async (collectionName, userId, field, operation = 'sum') => {
      try {
        const items = await firestoreService.getCollection(collectionName, userId);
        
        if (operation === 'sum') {
          return items.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
        } else if (operation === 'count') {
          return items.length;
        } else if (operation === 'average') {
          const sum = items.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
          return items.length > 0 ? sum / items.length : 0;
        }
        
        return 0;
      } catch (error) {
        console.error("Error getting totals:", error);
        throw error;
      }
    }
  };