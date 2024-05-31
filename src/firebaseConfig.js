 
// import { initializeApp } from "firebase/app";
// import { getAnalytics, isSupported } from "firebase/analytics";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from 'firebase/storage';

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
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export const storage = getStorage(app);
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

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

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firebase Analytics if supported
isSupported().then((yes) => {
  if (yes) {
    const analytics = getAnalytics(app);
  }
});
