import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
    apiKey: "AIzaSyBV-mgyAjSX4mHtvDx0J91tjkSpbnCjnyU",
    authDomain: "cstam-f4349.firebaseapp.com",
    projectId: "cstam-f4349",
    storageBucket: "cstam-f4349.firebasestorage.app",
    messagingSenderId: "822563232525",
    appId: "1:822563232525:web:8ad4bba916d93d319dee44",
    measurementId: "G-31G0DZZ7FK"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
