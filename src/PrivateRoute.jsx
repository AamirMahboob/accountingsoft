import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext'; // You need to create/use an AuthContext
import { Dashboard } from './layouts';

const PrivateRoute = ({ element: Element, ...rest }) => {
  const { currentUser } = useAuth();
  return currentUser ? <Dashboard {...rest} /> : <Navigate to="/auth/sign-in" />;
};

export default PrivateRoute;
