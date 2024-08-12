import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <p>로딩 중...</p>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
