import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import RiskBadge from '../components/RiskBadge';
import { LoadingSpinner, ErrorState } from '../components/LoadingSpinner';
import { 
  Building2, AlertTriangle, SunMedium, CloudLightning, 
  Users, MapPin, Send, PlusCircle, CheckCircle2, Filter, Eye
} from 'lucide-react';

const OfficerDashboard = () => {
  const { t, language } = useLanguage();

  const [dashboardData, setDashboardData] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Alert Broadcast Modal state
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastDistrict, setBroadcastDistrict] = useState('Chengalpattu');
  const [broadcastBlock, setBroadcastBlock] = useState('Tambaram');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState('dry_spell');
  const [broadcastSuccess, setBroadcastSuccess] = useState(null);
  const [sendingAlert, setSendingAlert] = useState(false);

  const fetchOfficerData = async (dist) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getOfficerDashboard(dist === 'All' ? null : dist);
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to load officer dashboard", err);
      setError("Unable to retrieve agriculture officer metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficerData(selectedDistrict);
  }, [selectedDistrict]);

  const handleSendAlert = async (e) => {
    e.preventDefault();
    setSendingAlert(true);
    try {
      const res = await api.sendAlert({
        district: broadcastDistrict,
        block: broadcastBlock,
        title: broadcastTitle,
        message: broadcastMsg,
        alert_type: broadcastType
      });
      setBroadcastSuccess(res.alert);
      // Refresh alert history in dashboard
      fetchOfficerData(selectedDistrict);
      setTimeout(() => {
        setShowBroadcastModal(false);
        setBroadcastSuccess(null);
        setBroadcastTitle('');
        setBroadcastMsg('');
      }, 2500);
    } catch (err) {
      console.error("Failed to send alert", err);
    } finally {
      setSendingAlert(false);
    }
  };

  const filteredRows = (dashboardData?.risk_table || []).filter(row => {
    if (selectedRisk !== 'All' && row.risk_level.toUpperCase() !== selectedRisk.toUpperCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="officer-dashboard-page">
      <div className="officer-page-header">
        <div>
          <span className="card-eyebrow">COMMAND & ADVISORY OPERATIONS</span>
          <h1 className="page-title">{t('officer_portal')}</h1>
          <p className="page-subtitle">
            District-wide agro-climatic surveillance, vulnerable block prioritization, and broadcast advisory dissemination.
          </p>
        </div>

        <div className="officer-header-actions">
          <Link to="/officer/map" className="btn-secondary">
            <MapPin size={18} />
            <span>Interactive Risk Map</span>
          </Link>
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="btn-primary"
          >
            <Send size={18} />
            <span>{t('send_alert_btn')}</span>
          </button>
        </div>
      </div>

      {loading && !dashboardData ? (
        <LoadingSpinner text="Aggregating block-level vulnerability matrices..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchOfficerData(selectedDistrict)} />
      ) : (
        <>
          {/* Top Metric Cards (Section 23) */}
          <div className="officer-metrics-grid">
            <div className="stat-card">
              <div className="stat-icon-wrap icon-blue">
                <Building2 size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-number">{dashboardData?.stats?.total_blocks || 43}</span>
                <span className="stat-title">{t('total_blocks')}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap icon-red">
                <AlertTriangle size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-number text-red">{dashboardData?.stats?.high_risk_blocks || 12}</span>
                <span className="stat-title">{t('high_risk_blocks')}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap icon-amber">
                <SunMedium size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-number text-amber">{dashboardData?.stats?.dry_spell_alerts || 8}</span>
                <span className="stat-title">{t('dry_spell_alerts')}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap icon-indigo">
                <CloudLightning size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-number text-blue">{dashboardData?.stats?.heavy_rain_alerts || 6}</span>
                <span className="stat-title">{t('heavy_rain_alerts')}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap icon-emerald">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-number text-emerald">{(dashboardData?.stats?.farmers_reached || 1420).toLocaleString()}</span>
                <span className="stat-title">{t('farmers_reached')}</span>
              </div>
            </div>
          </div>

          {/* District Risk Overview Table & Filters (Section 23) */}
          <div className="card officer-table-card">
            <div className="card-header-row">
              <h3 className="card-main-title">{t('district_overview')}</h3>

              <div className="table-filter-controls">
                <div className="filter-group">
                  <span className="filter-lbl">District:</span>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="officer-select"
                  >
                    <option value="All">All Districts</option>
                    {(dashboardData?.districts || []).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <span className="filter-lbl">Risk:</span>
                  <select
                    value={selectedRisk}
                    onChange={(e) => setSelectedRisk(e.target.value)}
                    className="officer-select"
                  >
                    <option value="All">All Risk</option>
                    <option value="LOW">🟢 Low</option>
                    <option value="MODERATE">🟡 Moderate</option>
                    <option value="HIGH">🟠 High</option>
                    <option value="CRITICAL">🔴 Critical</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="custom-data-table">
                <thead>
                  <tr>
                    <th>District</th>
                    <th>Block</th>
                    <th>Panchayat</th>
                    <th>Onset Prob</th>
                    <th>Dry Spell</th>
                    <th>Heavy Rain</th>
                    <th>Expected Rain (14D)</th>
                    <th>Risk Rating</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={`officer-row-${row.location_id}`}>
                      <td><strong>{row.district}</strong></td>
                      <td>{row.block}</td>
                      <td>{row.panchayat}</td>
                      <td>
                        <span className="text-blue font-bold">{row.onset_probability}%</span>
                      </td>
                      <td>
                        <span className="text-amber font-bold">{row.dry_spell_probability}%</span>
                      </td>
                      <td>
                        <span className="text-red font-bold">{row.heavy_rain_probability}%</span>
                      </td>
                      <td>{row.expected_rainfall} mm</td>
                      <td>
                        <RiskBadge level={row.risk_level} size="sm" />
                      </td>
                      <td>
                        <button
                          onClick={() => {
                            setBroadcastDistrict(row.district);
                            setBroadcastBlock(row.block);
                            setBroadcastTitle(`Agro Bulletin: ${row.block} Block`);
                            setBroadcastMsg(row.recommended_action);
                            setShowBroadcastModal(true);
                          }}
                          className="btn-table-action"
                          title="Broadcast Alert to this Block"
                        >
                          <Send size={14} />
                          <span>Dispatch Alert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alert History (Section 25) */}
          <div className="card officer-history-card">
            <div className="card-header-row">
              <div>
                <span className="card-eyebrow">AUDIT RECORD</span>
                <h3 className="card-main-title">{t('alert_history')}</h3>
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="custom-data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Alert Headline</th>
                    <th>Target Jurisdiction</th>
                    <th>Classification</th>
                    <th>Farmers Reached</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(dashboardData?.alert_history || []).map((h) => (
                    <tr key={`officer-hist-${h.id}`}>
                      <td>{h.date}</td>
                      <td><strong>{h.title}</strong></td>
                      <td>{h.message?.slice(0, 35)}...</td>
                      <td>
                        <span className="category-pill">{h.alert_type}</span>
                      </td>
                      <td>
                        <span className="text-emerald font-bold">{h.target_farmers}</span>
                      </td>
                      <td>
                        <span className="status-badge-sent">
                          <CheckCircle2 size={13} />
                          <span>{h.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Broadcast Alert Modal Dialog */}
      {showBroadcastModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Send size={22} className="text-emerald" />
                <h3>Dispatch Agricultural Weather Alert</h3>
              </div>
              <button onClick={() => setShowBroadcastModal(false)} className="modal-close-btn">✕</button>
            </div>

            {broadcastSuccess ? (
              <div className="modal-success-state">
                <CheckCircle2 size={48} className="text-emerald" />
                <h4>Alert Broadcast Successfully!</h4>
                <p>
                  Dispatched to <strong>{broadcastSuccess.target_farmers} registered farmers</strong> across {broadcastSuccess.location}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendAlert} className="modal-form">
                <div className="form-grid-2col">
                  <div className="form-group">
                    <label className="form-label">Target District</label>
                    <input
                      type="text"
                      value={broadcastDistrict}
                      onChange={(e) => setBroadcastDistrict(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target Block</label>
                    <input
                      type="text"
                      value={broadcastBlock}
                      onChange={(e) => setBroadcastBlock(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Alert Category</label>
                  <select
                    value={broadcastType}
                    onChange={(e) => setBroadcastType(e.target.value)}
                    className="form-select"
                  >
                    <option value="dry_spell">Dry Spell / Moisture Stress Warning</option>
                    <option value="heavy_rain">Heavy Rainfall & Inundation Warning</option>
                    <option value="monsoon_onset">Monsoon Onset Favorable Window</option>
                    <option value="sowing">Sowing & Tillage Advisory</option>
                    <option value="irrigation">Irrigation / Drainage Advice</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Alert Headline</label>
                  <input
                    type="text"
                    required
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. Dry Spell Warning: Next 7 Days"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Advisory Guidance Message</label>
                  <textarea
                    rows={4}
                    required
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    placeholder="Provide specific agricultural recommendations..."
                    className="form-textarea"
                  ></textarea>
                </div>

                <div className="modal-actions-footer">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingAlert}
                    className="btn-primary"
                  >
                    {sendingAlert ? "Broadcasting..." : "Broadcast Alert to Farmers"}
                    <Send size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;
