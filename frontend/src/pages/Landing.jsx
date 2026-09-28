import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  CloudRain, Sprout, MapPin, Compass, ShieldCheck, 
  ArrowRight, CheckCircle2, ChevronRight, BarChart3, Users
} from 'lucide-react';

const Landing = () => {
  const { t } = useLanguage();
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (role) => {
    try {
      const email = `${role}@example.com`;
      const pass = `${role}123`;
      await login(email, pass);
      if (role === 'officer') navigate('/officer/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/farmer/dashboard');
    } catch (err) {
      console.error("Demo login error", err);
      navigate('/login');
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-content">
          <div className="problem-badge">
            <span className="badge-pulse"></span>
            <span>Problem Statement ID: 26086 • Block/Village Scale</span>
          </div>

          <h1 className="hero-headline">
            Know the Rain.<br />
            <span className="text-gradient">Plan the Crop.</span>
          </h1>

          <p className="hero-subtitle">
            Hyperlocal monsoon onset & break prediction intelligence for smarter agricultural decisions. 
            Delivering 7–30 day probabilistic forecasts and crop-specific advisories at panchayat resolution.
          </p>

          <div className="hero-cta-group">
            <Link to="/register" className="btn-primary-large">
              <span>Get Started</span>
              <ArrowRight size={18} />
            </Link>
            <button 
              onClick={() => handleQuickDemo('farmer')} 
              className="btn-secondary-large"
            >
              <span>Instant Farmer Demo</span>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Quick Role Selectors */}
          <div className="quick-role-strip">
            <span className="quick-role-label">1-Click Test Access:</span>
            <button onClick={() => handleQuickDemo('farmer')} className="role-chip chip-farmer">
              🌾 Farmer Portal
            </button>
            <button onClick={() => handleQuickDemo('officer')} className="role-chip chip-officer">
              🏛️ Agriculture Officer
            </button>
            <button onClick={() => handleQuickDemo('admin')} className="role-chip chip-admin">
              ⚙️ Admin System
            </button>
          </div>
        </div>

        <div className="hero-preview-card">
          <div className="preview-card-inner">
            <div className="preview-top">
              <span className="preview-tag">📍 Tambaram Block, Chengalpattu</span>
              <span className="preview-prob text-emerald">78% Onset Prob</span>
            </div>
            <h3 className="preview-card-title">Next 14-Day Monsoon Outlook</h3>
            <div className="preview-meters">
              <div className="mini-meter">
                <span className="m-val text-blue">78%</span>
                <span className="m-name">Monsoon Onset</span>
              </div>
              <div className="mini-meter">
                <span className="m-val text-amber">18%</span>
                <span className="m-name">Dry Spell Risk</span>
              </div>
              <div className="mini-meter">
                <span className="m-val text-red">28%</span>
                <span className="m-name">Heavy Rain</span>
              </div>
            </div>
            <div className="preview-advisory-callout">
              <Sprout size={18} className="text-emerald" />
              <p>🌾 <strong>Paddy:</strong> Favorable sowing window open Oct 4 – Oct 9. Soil moisture at 54%.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="features-section">
        <div className="section-header text-center">
          <h2 className="section-title">End-to-End Monsoon Intelligence Pipeline</h2>
          <p className="section-subtitle">Bridging global macro-climate models and local agricultural decision-making</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrap icon-blue">
              <CloudRain size={28} />
            </div>
            <h3 className="feature-title">7–30 Day Probabilistic Forecast</h3>
            <p className="feature-desc">
              Multi-horizon projections for monsoon onset, dry spells, and heavy precipitation spells tailored to individual agricultural blocks.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrap icon-amber">
              <MapPin size={28} />
            </div>
            <h3 className="feature-title">Block-Level Risk Visualization</h3>
            <p className="feature-desc">
              Interactive Leaflet maps classifying vulnerability across Tamil Nadu districts with color-coded multi-hazard risk indices.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrap icon-emerald">
              <Sprout size={28} />
            </div>
            <h3 className="feature-title">Actionable Crop Advisory</h3>
            <p className="feature-desc">
              Rule-based expert system converting meteorological probabilities into clear sowing windows, irrigation timing, and input precautions.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrap icon-purple">
              <Compass size={28} />
            </div>
            <h3 className="feature-title">Climate Teleconnections</h3>
            <p className="feature-desc">
              Real-time integration of ENSO, Indian Ocean Dipole (IOD), and Madden-Julian Oscillation (MJO) phase dynamics.
            </p>
          </div>
        </div>
      </section>

      {/* Prediction Engine Architecture / How it Works */}
      <section className="how-it-works-section">
        <div className="section-header text-center">
          <span className="card-eyebrow">HYBRID PREDICTION ARCHITECTURE</span>
          <h2 className="section-title">How the Prediction Engine Operates</h2>
          <p className="section-subtitle">
            The platform combines climate indicators and local weather signals to estimate the probability of rainfall events and dry spells.
          </p>
        </div>

        <div className="pipeline-flow-diagram">
          <div className="flow-step">
            <div className="flow-step-num">1</div>
            <h4>Climate Signals</h4>
            <p>ENSO, IOD & MJO phase coupling</p>
          </div>
          <div className="flow-arrow">➔</div>
          <div className="flow-step">
            <div className="flow-step-num">2</div>
            <h4>Local Telemetry</h4>
            <p>180-day rainfall, temp & soil moisture</p>
          </div>
          <div className="flow-arrow">➔</div>
          <div className="flow-step">
            <div className="flow-step-num">3</div>
            <h4>Hybrid ML Model</h4>
            <p>Random Forest multi-output regression</p>
          </div>
          <div className="flow-arrow">➔</div>
          <div className="flow-step">
            <div className="flow-step-num">4</div>
            <h4>Advisory Engine</h4>
            <p>Bilingual Tamil/English crop advisories</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
