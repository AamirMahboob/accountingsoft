import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import PrivateRoute from './PrivateRoute' 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
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

