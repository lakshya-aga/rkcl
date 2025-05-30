// src/utils/firebaseUtils.js
import { db } from '../lib/firebase';
import {
  query,
  where,
  getDocs,
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

/**
 * Save a new dropdown option to Firestore if it doesn't already exist.
 * 
 * @param {string} collectionName - Firestore collection for dropdown options (e.g., "categories")
 * @param {string} value - The dropdown value to save
 */
export const saveDropdownValue = async (collectionName, value) => {
    if (!value) return;
  
    try {
      const colRef = collection(db, collectionName);
  
      // Normalize to lowercase (optional, for case-insensitive matching)
      const normalizedValue = value.trim();
  
      const q = query(colRef, where('name', '==', normalizedValue));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        await addDoc(colRef, {
          name: normalizedValue,
          createdAt: Timestamp.now(),
        });
        console.log(`Added new value '${value}' to ${collectionName}`);
      } else {
        console.log(`Value '${value}' already exists in ${collectionName}`);
      }
    } catch (error) {
      console.error(`Error saving to ${collectionName}:`, error);
    }
  };

export const saveItem = async (itemData) => {
  const newItem = {
    ...itemData,
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'items', newItem.code), newItem);
};

/**
 * Save a purchase and its items
 * @param {Object} purchaseData - Includes metadata and items array
 */
export const savePurchase = async (purchaseData) => {
  try {
    const purchase = {
      ...purchaseData,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'purchases', purchaseData.purchaseNumber), purchase);
    console.log('Purchase saved with ID:', docRef.id);
    let newBatches = [];

    for (const item of purchaseData.items) {
      const itemRef = doc(db, 'items', item.code);

      const batches = itemRef.batchNumbers || [];
      const initialBatchCount = batches.length;
      for (let i = initialBatchCount; i < item.quantity + initialBatchCount; i++) {
      batches.push(`${item.code}-${purchaseData.purchaseNumber}-${i + 1}`);
      }

      await setDoc(itemRef, {
      ...item,
      batchNumbers: batches,
      createdAt: Timestamp.now(),
      });

      // Add to newBatches list
      newBatches.push({
      itemCode: item.sku,
      quantity: item.qty,
      batchNumbers: batches,
      createdAt: Timestamp.now(),
      });
    }

    for (const batch of newBatches) {
      await addDoc(collection(db, 'batches'), batch);
    }

    return docRef.id;
  } catch (error) {
    console.error('Error saving purchase:', error);
    throw error;
  }
};

export const fetchDropdownValues = async (collectionName) => {
  console.log("Fetching from:", collectionName);
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const names = snapshot.docs.map((doc) => doc.data().name);
    console.log(collectionName, '->', names);
    return names;
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    return [];
  }
};

export const deleteItem = async (id) => {
  try {
    await deleteDoc(doc(db, 'items', id));  
} catch (error) {
  console.error('Error deleting item:', error);
}};

export const fetchAllItems = async () => {
  try {
    const colRef = collection(db, 'items');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
};
