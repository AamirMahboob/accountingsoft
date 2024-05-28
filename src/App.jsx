import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import PrivateRoute from './PrivateRoute';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';
import { useEffect } from "react";

function App() {
  const { currentUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (currentUser && location.pathname === "/") {
      // Redirect to the expenseandincome page if the user is logged in and the current path is "/"
      return <Navigate to="/dashboard/expenseandincome" />;
    }
  }, [currentUser, location.pathname]);

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

