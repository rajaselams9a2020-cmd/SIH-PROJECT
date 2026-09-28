import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, 
  Tooltip, Legend, CartesianGrid 
} from 'recharts';
import { BarChart3, Calendar } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-custom-tooltip">
        <p className="tooltip-date">📅 {label}</p>
        {payload.map((entry, index) => (
          <p key={`tooltip-item-${index}`} style={{ color: entry.color }} className="tooltip-item">
            {entry.name}: <strong>{entry.value} mm</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ForecastChart = ({ data = [] }) => {
  const { t } = useLanguage();
  const [horizon, setHorizon] = useState(14); // 7, 14, 21, 30

  // Slice data according to active horizon tab
  const displayData = (data || []).slice(0, horizon).map(item => ({
    date: item.date ? item.date.slice(5) : `D${item.day}`, // MM-DD
    fullDate: item.date,
    day: item.day,
    expectedRainfall: item.rainfall,
    historicalAvg: item.historical_avg,
    onsetProbability: item.onset_probability,
    drySpellProbability: item.dry_spell_probability
  }));

  const totalExpected = displayData.reduce((acc, curr) => acc + (curr.expectedRainfall || 0), 0);
  const totalHistorical = displayData.reduce((acc, curr) => acc + (curr.historicalAvg || 0), 0);

  return (
    <div className="card forecast-chart-card">
      <div className="chart-header-row">
        <div>
          <span className="card-eyebrow">TEMPORAL OUTLOOK</span>
          <h3 className="card-main-title">{t('chart_title')}</h3>
        </div>

        {/* Tab Controls for 7, 14, 21, 30 Days */}
        <div className="chart-tabs-wrap">
          <button
            className={`chart-tab ${horizon === 7 ? 'active' : ''}`}
            onClick={() => setHorizon(7)}
          >
            {t('tab_7d')}
          </button>
          <button
            className={`chart-tab ${horizon === 14 ? 'active' : ''}`}
            onClick={() => setHorizon(14)}
          >
            {t('tab_14d')}
          </button>
          <button
            className={`chart-tab ${horizon === 21 ? 'active' : ''}`}
            onClick={() => setHorizon(21)}
          >
            {t('tab_21d')}
          </button>
          <button
            className={`chart-tab ${horizon === 30 ? 'active' : ''}`}
            onClick={() => setHorizon(30)}
          >
            {t('tab_30d')}
          </button>
        </div>
      </div>

      <div className="chart-summary-strip">
        <div className="chart-stat">
          <span className="stat-label">Total Expected Rainfall ({horizon}D):</span>
          <span className="stat-val-bold">{totalExpected.toFixed(1)} mm</span>
        </div>
        <div className="chart-stat">
          <span className="stat-label">{t('historical_avg')}:</span>
          <span className="stat-val-normal">{totalHistorical.toFixed(1)} mm</span>
        </div>
        <div className="chart-stat">
          <span className="stat-label">Net Deviation:</span>
          <span className={`stat-pill ${totalExpected >= totalHistorical ? 'pill-positive' : 'pill-negative'}`}>
            {(totalExpected - totalHistorical) > 0 ? `+${(totalExpected - totalHistorical).toFixed(1)}` : (totalExpected - totalHistorical).toFixed(1)} mm
          </span>
        </div>
      </div>

      <div className="chart-svg-container" style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={displayData} margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 12 }}
              unit=" mm"
              label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px' }} />
            <Bar 
              dataKey="expectedRainfall" 
              name="Expected Rainfall" 
              fill="#0284c7" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={32}
            />
            <Line 
              type="monotone" 
              dataKey="historicalAvg" 
              name={t('historical_avg')} 
              stroke="#eab308" 
              strokeWidth={2.5} 
              dot={{ r: 3, fill: '#eab308' }} 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForecastChart;
