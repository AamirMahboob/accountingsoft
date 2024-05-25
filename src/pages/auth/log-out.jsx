 
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from "firebase/auth";
import { auth } from './../../firebaseConfig' // Adjust the path as necessary

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut(auth);
        console.log("User signed out successfully");
        // navigate('/auth/sign-in'); // Redirect to sign-in page after logout
      } catch (error) {
        console.error("Error signing out:", error);
      }
    };

    performLogout();
  }, [navigate]);

  return <div>Logging out...</div>; // Optional: You can add a loading spinner here
};

export default Logout;
