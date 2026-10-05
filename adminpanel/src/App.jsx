import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';

import AllBroker from './pages/AllBroker';
import BannerSetting from './pages/BannerSetting';
import AddLocality from './pages/AddLocality';
import AllLocality from './pages/AllLocality';
import Dashboard from './pages/Dashboard';
import AllProperty from './pages/AllProperty';
import AddBroker from './pages/AddBroker';
import AdminLogin from './pages/AdminLogin';
import CreateAdmin from './pages/CreateAdmin';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';
import ChangePassword from './pages/ChangePassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ✅ Public Routes */}
        <Route path="/" element={<AdminLogin />} />
        <Route path="/create-admin" element={<CreateAdmin />} />

        {/* 🔒 Protected Routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/all-broker" element={<AllBroker />} />
          <Route path="/banner-setting" element={<BannerSetting />} />
          <Route path="/add-locality" element={<AddLocality />} />
          <Route path="/all-locality" element={<AllLocality />} />
          <Route path="/all-property" element={<AllProperty />} />
          <Route path="/add-broker" element={<AddBroker />} />
           <Route path="/add-property" element={<AddProperty />} />
           <Route path="/edit-property-admin/:id" element={<EditProperty/>} />
                     <Route path="/change-password" element={<ChangePassword/>} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;