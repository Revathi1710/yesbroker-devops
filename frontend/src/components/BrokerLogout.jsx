

import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const BrokerLogout = () => {
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/broker/logout`,
        {},
        { withCredentials: true }
      );
      toast.success('Logged out successfully');
    } catch (_) {
      // Even if the API call fails, clear local state and redirect
    } finally {
      setLoading(false);
      navigate('/login');
    }
  };

  return { logout, loading };
};

export default BrokerLogout;