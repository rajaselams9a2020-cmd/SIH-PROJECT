import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import Forecast from './pages/Forecast';
import Advisory from './pages/Advisory';
import RiskMap from './pages/RiskMap';
import Alerts from './pages/Alerts';
import ClimateIndices from './pages/ClimateIndices';
import OfficerDashboard from './pages/OfficerDashboard';
import OfficerMap from './pages/OfficerMap';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

const AppLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isPublicPage = ['/', '/login', '/register'].includes(location.pathname);

  return (
    <div className="app-shell">
      <Navbar />

      <div className={`app-body-container ${isPublicPage ? 'public-layout' : 'dashboard-layout'}`}>
        {!isPublicPage && user && <Sidebar />}
        <main className="main-content-viewport">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Farmer Routes */}
            <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/advisory" element={<Advisory />} />
            <Route path="/risk-map" element={<RiskMap />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/climate-indices" element={<ClimateIndices />} />

            {/* Officer Routes */}
            <Route path="/officer/dashboard" element={<OfficerDashboard />} />
            <Route path="/officer/map" element={<OfficerMap />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Profile & Default */}
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <AppLayout />
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
