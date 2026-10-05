import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import Home from "./pages/Home";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddProperty from "./pages/AddProperty";
import ProfileDetails from "./pages/ProfileDetails";
import Properties from "./pages/Properties";
import EditProperty from "./pages/EditProperty";
import YourSuccessStory from "./pages/YourSuccessStory";
import BrokerView from "./pages/BrokerView";
import PropertySearch from "./pages/PropertySearch";
import BrokerLayout from "./pages/BrokerLayout";
import { BrokerProvider } from "./context/BrokerContext"; // Ensure you import the Provider
import Login from "./pages/Login";
import PropertyTypeSearch from "./pages/PropertyTypeSearch";
import About from "./pages/About";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Help from "./pages/Help";
import BrokerView2 from "./pages/BrokerView2";
import PropertyDetails from "./components/PropertyDetails";

function App() {
  return (
    <BrokerProvider> {/* Wrap the entire app so context is available everywhere */}
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
           <Route path="/about" element={<About />} />
                  <Route path="/terms" element={<Terms />} />
                     <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                          <Route path="/help" element={<Help />} />
          <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          <Route path="/brokers/:slug" element={<BrokerView />} />
                <Route path="/brokers2/:slug" element={<BrokerView2 />} />
          <Route path="/property/:type/:locality" element={<PropertySearch />} />
             <Route path="/property-details/:id" element={<PropertyDetails />} />
          

          {/* Protected Broker Routes - Using BrokerLayout as a wrapper */}
          <Route path="/broker-dashboard" element={
            <BrokerLayout><Dashboard /></BrokerLayout>
          } />
          
          <Route path="/add-property" element={
            <BrokerLayout><AddProperty /></BrokerLayout>
          } />
          
          <Route path="/profile" element={
            <BrokerLayout><ProfileDetails /></BrokerLayout>
          } />
          
          <Route path="/properties" element={
            <BrokerLayout><Properties /></BrokerLayout>
          } />
          
          <Route path="/edit-property/:id" element={
            <BrokerLayout><EditProperty /></BrokerLayout>
          } />
          
          <Route path="/success-stories" element={
            <BrokerLayout><YourSuccessStory /></BrokerLayout>
          } />
            <Route path="/:typeproperty"           element={<PropertyTypeSearch />} />
      <Route path="/:typeproperty/:locality" element={<PropertyTypeSearch />} />
        </Routes>
      </BrowserRouter>
    </BrokerProvider>
  );
}

export default App;