import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const RainfallChart = ({ data = [] }) => {
  const { t } = useLanguage();

  const chartData = (data || []).slice(0, 30).map(item => ({
    date: item.date ? item.date.slice(5) : `D${item.day}`,
    onset: item.onset_probability,
    drySpell: item.dry_spell_probability,
    heavyRain: item.heavy_rain_probability,
    confidence: item.confidence
  }));

  return (
    <div className="card rainfall-probability-chart">
      <div className="card-header-row">
        <div>
          <span className="card-eyebrow">RISK & PROBABILITY DYNAMICS</span>
          <h3 className="card-main-title">30-Day Monsoon Evolution Trajectory</h3>
        </div>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 15, right: 20, bottom: 15, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} unit="%" domain={[0, 100]} />
            <Tooltip 
              formatter={(val, name) => [`${val}%`, name]}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
            />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
            <Line 
              type="monotone" 
              dataKey="onset" 
              name={t('onset_prob')} 
              stroke="#0284c7" 
              strokeWidth={2} 
              dot={false} 
            />
            <Line 
              type="monotone" 
              dataKey="drySpell" 
              name={t('dry_spell_prob')} 
              stroke="#f59e0b" 
              strokeWidth={2} 
              dot={false} 
            />
            <Line 
              type="monotone" 
              dataKey="heavyRain" 
              name={t('heavy_rain_prob')} 
              stroke="#ef4444" 
              strokeWidth={2} 
              dot={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RainfallChart;
