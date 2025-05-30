// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC6v2n_XFvoqegNpCGxsxDkK96mMmli3oI",
    authDomain: "rkcl-8260b.firebaseapp.com",
    projectId: "rkcl-8260b",
    storageBucket: "rkcl-8260b.firebasestorage.app",
    messagingSenderId: "698316132495",
    appId: "1:698316132495:web:9cfb7815fb50f000b9e0fa",
    measurementId: "G-LLGMS0428X"
  };

// Prevent initializing more than once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
