import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CloudRain, Lock, Mail, ArrowRight, ShieldCheck, User } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      redirectByRole(loggedUser.role);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Invalid login credentials. Please verify email and password.");
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (role === 'officer') {
      navigate('/officer/dashboard');
    } else if (role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/farmer/dashboard');
    }
  };

  const fillDemoAccount = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setLoading(true);
    try {
      const loggedUser = await login(demoEmail, demoPass);
      redirectByRole(loggedUser.role);
    } catch (err) {
      console.error(err);
      setError("Demo authentication failed. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <CloudRain size={28} />
          </div>
          <h2 className="auth-title">Welcome to Varuna Agro</h2>
          <p className="auth-sub">Hyperlocal Monsoon Prediction & Advisory Platform</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary auth-submit-btn"
          >
            {loading ? "Authenticating..." : "Sign In to Platform"}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* 1-Click Demo Buttons */}
        <div className="demo-credentials-section">
          <div className="demo-divider">
            <span>OR INSTANT LOGIN WITH DEMO PROFILES</span>
          </div>

          <div className="demo-buttons-grid">
            <button
              type="button"
              onClick={() => fillDemoAccount('farmer@example.com', 'farmer123')}
              className="demo-profile-btn btn-demo-farmer"
            >
              <span className="demo-role-tag">🌾 Farmer</span>
              <span className="demo-email-tag">farmer@example.com</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('officer@example.com', 'officer123')}
              className="demo-profile-btn btn-demo-officer"
            >
              <span className="demo-role-tag">🏛️ Agriculture Officer</span>
              <span className="demo-email-tag">officer@example.com</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('admin@example.com', 'admin123')}
              className="demo-profile-btn btn-demo-admin"
            >
              <span className="demo-role-tag">⚙️ Administrator</span>
              <span className="demo-email-tag">admin@example.com</span>
            </button>
          </div>
        </div>

        <div className="auth-footer-link">
          <p>Don't have an account? <Link to="/register">Create Farmer Account</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
