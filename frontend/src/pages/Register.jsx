import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CloudRain, User, Mail, Lock, Phone, MapPin, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'farmer',
    language: 'en',
    state: 'Tamil Nadu',
    district: 'Chengalpattu',
    block: 'Tambaram',
    panchayat: 'Kadaperi'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const newUser = await register(formData);
      if (newUser.role === 'officer') {
        navigate('/officer/dashboard');
      } else {
        navigate('/farmer/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Registration failed. Please check your information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card register-auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <CloudRain size={28} />
          </div>
          <h2 className="auth-title">Farmer Registration</h2>
          <p className="auth-sub">Get hyperlocal monsoon alerts and agricultural guidance</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-grid-2col">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Murugan S"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98400 12345"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-grid-2col">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="farmer@example.com"
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
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-grid-2col">
            <div className="form-group">
              <label className="form-label">Account Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-select"
              >
                <option value="farmer">Farmer</option>
                <option value="officer">Agriculture Officer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Advisory Language</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="form-select"
              >
                <option value="en">English</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
              </select>
            </div>
          </div>

          {/* Location details */}
          <div className="location-inputs-section">
            <span className="location-section-title">Farm Location (Tamil Nadu)</span>
            <div className="form-grid-2col">
              <div className="form-group">
                <label className="form-label">District</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Chengalpattu">Chengalpattu</option>
                  <option value="Kanchipuram">Kanchipuram</option>
                  <option value="Tiruvallur">Tiruvallur</option>
                  <option value="Thanjavur">Thanjavur</option>
                  <option value="Madurai">Madurai</option>
                  <option value="Coimbatore">Coimbatore</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Block</label>
                <select
                  name="block"
                  value={formData.block}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Tambaram">Tambaram</option>
                  <option value="Kattankulathur">Kattankulathur</option>
                  <option value="Tiruporur">Tiruporur</option>
                  <option value="Chengalpattu">Chengalpattu</option>
                  <option value="Kumbakonam">Kumbakonam</option>
                  <option value="Vadipatti">Vadipatti</option>
                  <option value="Pollachi">Pollachi</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Panchayat / Village Name</label>
              <input
                type="text"
                name="panchayat"
                value={formData.panchayat}
                onChange={handleChange}
                placeholder="e.g. Kadaperi / Mudichur"
                className="form-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary auth-submit-btn"
          >
            {loading ? "Registering Account..." : "Complete Registration & Launch"}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer-link">
          <p>Already registered? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
