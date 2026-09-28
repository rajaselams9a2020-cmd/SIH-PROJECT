import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Mail, Phone, MapPin, Globe, CheckCircle2, ShieldCheck, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    language: 'en',
    district: '',
    block: '',
    panchayat: ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        language: user.language || language || 'en',
        district: user.district || 'Chengalpattu',
        block: user.block || 'Tambaram',
        panchayat: user.panchayat || 'Kadaperi'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser(formData);
      setLanguage(formData.language);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="page-title">{t('nav_profile')}</h1>
        <p className="page-subtitle">Manage personal contact information, regional language preferences, and farm coordinates.</p>
      </div>

      {savedSuccess && (
        <div className="toast-success-banner">
          <CheckCircle2 size={18} />
          <span>Profile preferences saved successfully!</span>
        </div>
      )}

      <div className="profile-layout-grid">
        <div className="profile-card card">
          <div className="profile-avatar-row">
            <div className="profile-avatar">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="profile-name">{user.name}</h2>
              <span className={`role-badge role-${user.role}`}>{user.role.toUpperCase()}</span>
              <p className="profile-email">{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
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
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Advisory Language</label>
              <div className="input-with-icon">
                <Globe size={18} className="input-icon" />
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

            <div className="form-grid-2col">
              <div className="form-group">
                <label className="form-label">District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Block</label>
                <input
                  type="text"
                  name="block"
                  value={formData.block}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Panchayat / Village</label>
              <input
                type="text"
                name="panchayat"
                value={formData.panchayat}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="profile-form-actions">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? "Saving Changes..." : "Save Preferences"}
              </button>

              <button
                type="button"
                onClick={logout}
                className="btn-secondary"
              >
                <LogOut size={16} />
                <span>{t('nav_logout')}</span>
              </button>
            </div>
          </form>
        </div>

        <div className="card profile-info-card">
          <div className="card-header-row">
            <h4 className="side-title">Jurisdiction & Permissions</h4>
            <ShieldCheck size={20} className="text-emerald" />
          </div>

          <div className="role-permissions-list">
            <div className="perm-item">
              <span className="perm-dot">✓</span>
              <span>7–30 day localized monsoon probability access</span>
            </div>
            <div className="perm-item">
              <span className="perm-dot">✓</span>
              <span>Crop-specific sowing window recommendation bulletins</span>
            </div>
            <div className="perm-item">
              <span className="perm-dot">✓</span>
              <span>Geospatial block vulnerability map visualization</span>
            </div>
            {user.role === 'officer' && (
              <div className="perm-item text-emerald">
                <span className="perm-dot">✓</span>
                <span>Direct broadcast emergency alert dispatch privilege</span>
              </div>
            )}
            {user.role === 'admin' && (
              <div className="perm-item text-indigo">
                <span className="perm-dot">✓</span>
                <span>System governance, telemetry & user administration</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
