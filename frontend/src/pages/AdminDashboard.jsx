import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { LoadingSpinner, ErrorState } from '../components/LoadingSpinner';
import { 
  ShieldCheck, Users, MapPin, Database, Cpu, Activity, 
  CheckCircle2, BellRing, Sprout, BarChart3, RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAdminDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to platform administration telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="admin-dashboard-page">
      <div className="page-header">
        <div className="admin-header-row">
          <div>
            <span className="card-eyebrow">SYSTEM GOVERNANCE</span>
            <h1 className="page-title">Platform Administrator Console</h1>
            <p className="page-subtitle">
              Infrastructure health, ML inference monitoring, and user registry metrics for Problem Statement ID 26086.
            </p>
          </div>

          <button onClick={fetchAdminData} className="btn-secondary">
            <RefreshCw size={16} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Querying SQLite telemetry and system services..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAdminData} />
      ) : (
        <div className="admin-content-stack">
          {/* System Health Strip (Section 26) */}
          <div className="card system-health-card">
            <div className="card-header-row">
              <div className="sh-title-wrap">
                <Activity size={20} className="text-emerald" />
                <h3 className="card-main-title">Live System Status & Health</h3>
              </div>
              <span className="uptime-pill">System Uptime: {data?.system_health?.uptime}</span>
            </div>

            <div className="health-nodes-grid">
              <div className="health-node">
                <span className="node-indicator online"></span>
                <div>
                  <span className="node-label">FastAPI Service:</span>
                  <strong className="node-val text-emerald">{data?.system_health?.api_status}</strong>
                </div>
              </div>

              <div className="health-node">
                <span className="node-indicator online"></span>
                <div>
                  <span className="node-label">SQLite Engine:</span>
                  <strong className="node-val text-emerald">{data?.system_health?.database_status}</strong>
                </div>
              </div>

              <div className="health-node">
                <span className="node-indicator online"></span>
                <div>
                  <span className="node-label">ML Inference Engine:</span>
                  <strong className="node-val text-blue">{data?.system_health?.model_status}</strong>
                </div>
              </div>

              <div className="health-node">
                <span className="node-indicator online"></span>
                <div>
                  <span className="node-label">Inference Latency:</span>
                  <strong className="node-val text-indigo">{data?.system_health?.ml_inference_latency}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Tiles (Section 26) */}
          <div className="admin-metrics-grid">
            <div className="stat-card">
              <div className="stat-icon-wrap icon-blue">
                <Users size={22} />
              </div>
              <div className="stat-content">
                <span className="stat-number">{data?.metrics?.total_users}</span>
                <span className="stat-title">Total Users ({data?.metrics?.farmers} Farmers, {data?.metrics?.officers} Officers)</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap icon-emerald">
                <MapPin size={22} />
              </div>
              <div className="stat-content">
                <span className="stat-number">{data?.metrics?.locations}</span>
                <span className="stat-title">Monitored Tamil Nadu Panchayats</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap icon-amber">
                <Sprout size={22} />
              </div>
              <div className="stat-content">
                <span className="stat-number">{data?.metrics?.crops}</span>
                <span className="stat-title">Registered Crop Phenology Profiles</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap icon-purple">
                <Database size={22} />
              </div>
              <div className="stat-content">
                <span className="stat-number">{data?.metrics?.weather_data_points?.toLocaleString()}</span>
                <span className="stat-title">180-Day Weather Data Points</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap icon-indigo">
                <BarChart3 size={22} />
              </div>
              <div className="stat-content">
                <span className="stat-number">{data?.metrics?.predictions_generated?.toLocaleString()}</span>
                <span className="stat-title">Forecast Predictions Generated</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrap icon-red">
                <BellRing size={22} />
              </div>
              <div className="stat-content">
                <span className="stat-number">{data?.metrics?.alerts_sent}</span>
                <span className="stat-title">Broadcast Alerts Dispatched</span>
              </div>
            </div>
          </div>

          {/* User Registry Table */}
          <div className="card admin-users-card">
            <div className="card-header-row">
              <h3 className="card-main-title">Recent User Registrations</h3>
              <span className="count-pill">{data?.metrics?.total_users} Registered</span>
            </div>

            <div className="table-responsive-wrapper">
              <table className="custom-data-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Assigned Jurisdiction</th>
                    <th>Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recent_users || []).map((u) => (
                    <tr key={`user-${u.id}`}>
                      <td>#{u.id}</td>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge role-${u.role}`}>{u.role.toUpperCase()}</span>
                      </td>
                      <td>{u.panchayat || u.block || 'Tamil Nadu'}, {u.district}</td>
                      <td>{u.created_at || 'Recently'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
