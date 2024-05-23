// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

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