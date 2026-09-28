import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { RefreshCw, AlertCircle } from 'lucide-react';

export const LoadingSpinner = ({ text }) => {
  const { t } = useLanguage();
  return (
    <div className="spinner-container">
      <div className="spinning-ring"></div>
      <p className="spinner-text">{text || t('loading')}</p>
    </div>
  );
};

export const ErrorState = ({ message, onRetry }) => {
  const { t } = useLanguage();
  return (
    <div className="error-state-card">
      <AlertCircle size={40} className="error-icon" />
      <h3 className="error-title">Unable to Load Data</h3>
      <p className="error-desc">{message || t('error_msg')}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-retry">
          <RefreshCw size={16} />
          <span>{t('retry')}</span>
        </button>
      )}
    </div>
  );
};

export const EmptyState = ({ message, actionText, onAction }) => {
  return (
    <div className="empty-state-card">
      <div className="empty-icon-wrap">🌱</div>
      <p className="empty-text">{message || "No records found."}</p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn-empty-action">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default LoadingSpinner;
