import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CloudRain, Globe, User, LogOut, Menu, X, ShieldAlert, Sprout } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'officer') return '/officer/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/farmer/dashboard';
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand / Logo */}
        <Link to={getDashboardPath()} className="brand-logo">
          <div className="logo-icon-wrap">
            <CloudRain className="logo-icon" />
          </div>
          <div>
            <h1 className="brand-title">{t('appName')}</h1>
            <p className="brand-subtitle">{t('appSub')}</p>
          </div>
        </Link>

        {/* Desktop Nav Controls */}
        <div className="nav-controls desktop-only">
          {/* Language Switcher */}
          <div className="lang-switcher">
            <Globe size={18} className="lang-icon" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="lang-select"
              aria-label="Select Language"
            >
              <option value="en">English</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
            </select>
          </div>

          {user ? (
            <div className="user-nav-actions">
              <span className={`role-badge role-${user.role}`}>
                {user.role.toUpperCase()}
              </span>
              <Link to="/profile" className="user-profile-btn" title="Profile">
                <User size={18} />
                <span className="user-name">{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn" title={t('nav_logout')}>
                <LogOut size={18} />
                <span>{t('nav_logout')}</span>
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn-secondary">{t('nav_login')}</Link>
              <Link to="/register" className="btn-primary">{t('nav_register')}</Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="mobile-toggle mobile-only"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer mobile-only">
          <div className="mobile-lang-row">
            <Globe size={18} />
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="lang-select mobile-select"
            >
              <option value="en">English</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
            </select>
          </div>

          {user ? (
            <div className="mobile-user-links">
              <p className="mobile-user-name">👤 {user.name} ({user.role})</p>
              <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>{t('nav_dashboard')}</Link>
              <Link to="/forecast" onClick={() => setMobileMenuOpen(false)}>{t('nav_forecast')}</Link>
              <Link to="/risk-map" onClick={() => setMobileMenuOpen(false)}>{t('nav_risk_map')}</Link>
              <Link to="/advisory" onClick={() => setMobileMenuOpen(false)}>{t('nav_advisory')}</Link>
              <Link to="/alerts" onClick={() => setMobileMenuOpen(false)}>{t('nav_alerts')}</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>{t('nav_profile')}</Link>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="mobile-logout">
                {t('nav_logout')}
              </button>
            </div>
          ) : (
            <div className="mobile-auth-links">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary">{t('nav_login')}</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary">{t('nav_register')}</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
