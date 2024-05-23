import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import PrivateRoute from './PrivateRoute' 

function App() {
  return (
    <Routes>
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/dashboard/*" element={<PrivateRoute element={<Dashboard />} />} />
      <Route path="*" element={<Navigate to="/auth/sign-in" />} />
    </Routes>
  );
}

export default App;

