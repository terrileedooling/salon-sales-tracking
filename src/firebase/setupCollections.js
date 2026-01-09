import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Function to create a test user's data
export const createTestData = async (userId) => {
  try {
    
    // 1. Create user document
    const userDoc = {
      uid: userId,
      email: 'test@salon.com',
      name: 'Test Salon Owner',
      businessName: 'Test Beauty Salon',
      phone: '+27 11 123 4567',
      role: 'business_owner',
      settings: {
        currency: 'ZAR',
        language: 'en',
        notifications: true,
        lowStockAlert: true,
        taxRate: 15
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // 2. Create categories
    const categories = ['Haircare', 'Skincare', 'Makeup', 'Tools'];
    for (const catName of categories) {
      await addDoc(collection(db, 'categories'), {
        name: catName,
        userId: userId,
        createdAt: serverTimestamp(),
        modifiedAt: serverTimestamp(),
        description: "Stuff"
      });
    }
    
    // 3. Create suppliers
    const supplier = await addDoc(collection(db, 'suppliers'), {
      name: 'Beauty Wholesalers',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@beautywholesale.co.za',
      phone: '+27 21 987 6543',
      active: true,
      userId: userId,
      createdAt: serverTimestamp(),
      modifiedAt: serverTimestamp()
    });
    
    // 4. Create sample products
    const products = [
      {
        name: 'Professional Shampoo',
        description: 'Moisturizing shampoo for all hair types',
        category: 'Haircare',
        price: 25.99,
        cost: 15.50,
        stock: 50,
        minStock: 10,
        unit: 'bottle',
        supplierId: supplier.id,
        userId: userId,
        createdAt: serverTimestamp(),
        modifiedAt: serverTimestamp()
      },
      {
        name: 'Conditioner',
        description: 'Deep conditioning treatment',
        category: 'Haircare',
        price: 28.99,
        cost: 18.00,
        stock: 45,
        minStock: 10,
        unit: 'bottle',
        supplierId: supplier.id,
        userId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];
    
    for (const product of products) {
      await addDoc(collection(db, 'products'), product);
    }
    
    return true;
  } catch (error) {
    console.error('Error creating test data:', error);
    return false;
  }
};

// Function to check if collections exist
export const checkCollections = async () => {
  const collections = ['products', 'sales', 'suppliers', 'categories'];
  const results = {};
  
  for (const coll of collections) {
    try {
      // Try to add a test document to see if collection exists
      const testDoc = await addDoc(collection(db, coll), {
        test: true,
        createdAt: serverTimestamp()
      });
      
      // Delete the test document
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, coll, testDoc.id));
      
      results[coll] = 'Exists and writable';
    } catch (error) {
      results[coll] = `Error: ${error.message}`;
    }
  }
  
  return results;
};