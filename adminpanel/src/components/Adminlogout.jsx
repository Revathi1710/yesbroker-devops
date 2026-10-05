import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // Ensure this is imported

const Adminlogout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/logout`,
        {},
        { withCredentials: true }
      );
      toast.success('Logged out successfully');
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: clear local storage if the server fails
    } finally {
      // Always clear local data and redirect
      localStorage.removeItem('admin_token'); 
      setLoading(false);
      navigate('/');
    }
  };

  return { logout, loading };
};

export default Adminlogout;