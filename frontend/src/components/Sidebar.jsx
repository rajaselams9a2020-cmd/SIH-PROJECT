import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, CloudSun, MapPin, Sprout, Bell, 
  Compass, UserCircle, LogOut, Users, Database, ShieldCheck, BarChart3
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = user.role || 'farmer';

  return (
    <aside className="sidebar-container">
      <div className="sidebar-nav-list">
        {role === 'farmer' && (
          <>
            <NavLink to="/farmer/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>{t('nav_dashboard')}</span>
            </NavLink>
            <NavLink to="/forecast" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <CloudSun size={20} />
              <span>{t('nav_forecast')}</span>
            </NavLink>
            <NavLink to="/risk-map" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <MapPin size={20} />
              <span>{t('nav_risk_map')}</span>
            </NavLink>
            <NavLink to="/advisory" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Sprout size={20} />
              <span>{t('nav_advisory')}</span>
            </NavLink>
            <NavLink to="/alerts" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Bell size={20} />
              <span>{t('nav_alerts')}</span>
            </NavLink>
            <NavLink to="/climate-indices" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Compass size={20} />
              <span>{t('nav_climate')}</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <UserCircle size={20} />
              <span>{t('nav_profile')}</span>
            </NavLink>
          </>
        )}

        {role === 'officer' && (
          <>
            <NavLink to="/officer/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>{t('nav_dashboard')}</span>
            </NavLink>
            <NavLink to="/officer/map" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <MapPin size={20} />
              <span>{t('nav_risk_map')}</span>
            </NavLink>
            <NavLink to="/advisory" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Sprout size={20} />
              <span>{t('nav_advisory')}</span>
            </NavLink>
            <NavLink to="/alerts" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Bell size={20} />
              <span>{t('nav_alerts')}</span>
            </NavLink>
            <NavLink to="/forecast" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <BarChart3 size={20} />
              <span>Analytics & Forecast</span>
            </NavLink>
            <NavLink to="/climate-indices" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Compass size={20} />
              <span>{t('nav_climate')}</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <UserCircle size={20} />
              <span>{t('nav_profile')}</span>
            </NavLink>
          </>
        )}

        {role === 'admin' && (
          <>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>{t('nav_dashboard')}</span>
            </NavLink>
            <NavLink to="/risk-map" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <MapPin size={20} />
              <span>{t('nav_risk_map')}</span>
            </NavLink>
            <NavLink to="/forecast" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <BarChart3 size={20} />
              <span>{t('nav_forecast')}</span>
            </NavLink>
            <NavLink to="/climate-indices" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Compass size={20} />
              <span>{t('nav_climate')}</span>
            </NavLink>
            <NavLink to="/alerts" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Bell size={20} />
              <span>{t('nav_alerts')}</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <UserCircle size={20} />
              <span>{t('nav_profile')}</span>
            </NavLink>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout-btn">
          <LogOut size={18} />
          <span>{t('nav_logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
