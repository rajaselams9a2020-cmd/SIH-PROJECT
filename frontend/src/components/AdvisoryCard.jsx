import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import RiskBadge from './RiskBadge';
import { Sprout, CheckCircle2, AlertTriangle, Calendar, Sparkles, Languages } from 'lucide-react';

const AdvisoryCard = ({ advisory, sowingWindow }) => {
  const { language, t } = useLanguage();
  const [showTamil, setShowTamil] = useState(language === 'ta');

  if (!advisory) return null;

  const isTamil = showTamil || language === 'ta';

  const {
    crop_name = "Paddy",
    crop_tamil_name = "நெல் (Paddy)",
    severity = "MODERATE",
    message = "Rainfall conditions are moderately favorable. Monitor rainfall before sowing.",
    tamil_message = "மழைப்பொழிவு நிலை மிதமான சாதகமாக உள்ளது. விதைப்பதற்கு முன் மழை நிலையை கண்காணிக்கவும்.",
    action_items = [
      "Prepare certified seeds",
      "Clean irrigation channels",
      "Monitor rainfall",
      "Avoid unnecessary irrigation"
    ],
    tamil_action_items = [
      "சான்றளிக்கப்பட்ட விதைகளை தயார் செய்யவும்",
      "பாசன வாய்க்கால்களை சுத்தம் செய்யவும்",
      "மழை நிலையை தொடர்ந்து கண்காணிக்கவும்",
      "தேவையற்ற பாசனத்தை தவிர்க்கவும்"
    ]
  } = advisory;

  const activeMessage = isTamil ? (tamil_message || message) : message;
  const activeActions = isTamil ? (tamil_action_items && tamil_action_items.length > 0 ? tamil_action_items : action_items) : action_items;

  return (
    <div className="card advisory-card">
      <div className="card-header-row">
        <div className="advisory-crop-header">
          <div className="crop-avatar">🌾</div>
          <div>
            <span className="card-eyebrow">{t('today_advisory')}</span>
            <h3 className="card-main-title">{isTamil ? crop_tamil_name : crop_name}</h3>
          </div>
        </div>

        <div className="header-actions-right">
          <button 
            type="button" 
            onClick={() => setShowTamil(!showTamil)}
            className="lang-toggle-pill"
            title="Toggle Tamil / English advisory"
          >
            <Languages size={15} />
            <span>{isTamil ? "Switch to English" : "தமிழில் படிக்க"}</span>
          </button>
          <RiskBadge level={severity} />
        </div>
      </div>

      <div className="advisory-msg-callout">
        <p className="advisory-body-text">{activeMessage}</p>
      </div>

      {/* Action Checklist */}
      <div className="advisory-actions-section">
        <h4 className="actions-section-title">
          <CheckCircle2 size={18} className="text-emerald" />
          <span>{t('recommended_action')}</span>
        </h4>
        <div className="actions-grid">
          {activeActions.map((action, idx) => (
            <div key={`action-${idx}`} className="action-item-tile">
              <span className="action-check-badge">✓</span>
              <span className="action-text">{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sowing Window Segment if available */}
      {sowingWindow && (
        <div className="sowing-window-strip">
          <div className="sowing-window-header">
            <div className="sowing-title-wrap">
              <Calendar size={18} className="sowing-icon" />
              <h4 className="sowing-window-title">{t('recommended_sowing')}</h4>
            </div>
            <span className="sowing-status-badge">{isTamil ? (sowingWindow.tamil_status || sowingWindow.current_status) : sowingWindow.current_status}</span>
          </div>

          <div className="sowing-details-row">
            <div className="sowing-date-tile">
              <span className="sowing-label">{t('recommended_dates')}</span>
              <span className="sowing-dates-bold">{sowingWindow.recommended_start_date} – {sowingWindow.recommended_end_date}</span>
            </div>
            <div className="sowing-reason-tile">
              <span className="sowing-label">{t('reason')}</span>
              <p className="sowing-reason-text">{isTamil ? (sowingWindow.tamil_reason || sowingWindow.reason) : sowingWindow.reason}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvisoryCard;
