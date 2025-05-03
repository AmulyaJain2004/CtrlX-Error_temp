import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUserContext } from '../context/userContext';

const PrivateRoute = ({ allowedRoles }) => {
  const { user } = useUserContext();

  // If not logged in, redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // If role not allowed, redirect to home or unauthorized page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
