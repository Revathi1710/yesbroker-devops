import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';

const AdminProtectedRoute = () => {
  const [auth, setAuth] = useState({ loading: true, isAdmin: false });

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/check-auth`,
          { withCredentials: true }
        );
        setAuth({ loading: false, isAdmin: res.data.success });
      } catch (error) {
        setAuth({ loading: false, isAdmin: false });
      }
    };
    checkAdminAuth();
  }, []);

  if (auth.loading) return <div>Loading...</div>;

  return auth.isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminProtectedRoute;