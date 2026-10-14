import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: '#64748b' }}>
        Checking session...
      </div>
    );
  }

  return user ? <Navigate to="/home" replace /> : <Outlet />;
};

export default PublicRoute;
