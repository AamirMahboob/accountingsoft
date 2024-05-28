import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import PrivateRoute from './PrivateRoute' 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";

function App() {
   const {currentUser} = useAuth()
   const navigate =  useNavigate()
   useEffect(() => {
    // Redirect to dashboard/expenseandincome if the user is authenticated
    // and they are not already on a protected route
    if (currentUser && window.location.pathname === '/auth/sign-in') {
      navigate('/dashboard/expenseandincome');
    }
  }, [currentUser, navigate]);

  return (
    <>
    <Routes>
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/dashboard/*" element={<PrivateRoute element={<Dashboard />} />} />
      <Route path="*" element={<Navigate to="/auth/sign-in" />} />
    </Routes>
     <ToastContainer />
  </>
  );

}

export default App;

