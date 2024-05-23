// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
// import { getFirestore, doc, setDoc } from "firebase/firestore"; // Import Firestore functions

// const firebaseConfig = {
//   apiKey: "AIzaSyB1xL_p_p5mMIs7E8aiWWTBBitJg1XqrKw",
//   authDomain: "accounting-soft-b4d89.firebaseapp.com",
//   projectId: "accounting-soft-b4d89",
//   storageBucket: "accounting-soft-b4d89.appspot.com",
//   messagingSenderId: "491595000911",
//   appId: "1:491595000911:web:acba5a01427607cf024e3a",
//   measurementId: "G-TVWHXH5BZD"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// export const auth = getAuth(app);
// export const db = getFirestore(app); // Initialize Firestore

// /**
//  * Register a new user with email and password, and store additional user information in Firestore.
//  * @param {string} email - User's email.
//  * @param {string} password - User's password.
//  * @param {object} additionalData - Additional user data (e.g., roles).
//  */
// export const registerUser = async (email, password, additionalData) => {
//   try {
//     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;

//     // Store user additional data in Firestore
//     await setDoc(doc(db, "users", user.uid), {
//       email: user.email,
//       roles: additionalData.roles,
//       ...additionalData // Spread other additional data
//     });

//     console.log("User registered successfully:", user.uid);
//   } catch (error) {
//     console.error("Error registering user:", error.message);
//   }
// };

// firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyB1xL_p_p5mMIs7E8aiWWTBBitJg1XqrKw",
  authDomain: "accounting-soft-b4d89.firebaseapp.com",
  projectId: "accounting-soft-b4d89",
  storageBucket: "accounting-soft-b4d89.appspot.com",
  messagingSenderId: "491595000911",
  appId: "1:491595000911:web:acba5a01427607cf024e3a",
  measurementId: "G-TVWHXH5BZD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app); // Export Firestore
