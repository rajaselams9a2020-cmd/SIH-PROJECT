import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { MapPin } from 'lucide-react';

const LocationSelector = ({ selectedLocationId, onLocationChange }) => {
  const { t } = useLanguage();
  const [states, setStates] = useState(['Tamil Nadu']);
  const [selectedState, setSelectedState] = useState('Tamil Nadu');

  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('Chengalpattu');

  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState('Tambaram');

  const [panchayats, setPanchayats] = useState([]);
  const [selectedPanchayatId, setSelectedPanchayatId] = useState(selectedLocationId || 1);

  // Load districts when state changes
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const data = await api.getDistricts(selectedState);
        setDistricts(data);
        if (data.length > 0 && !data.includes(selectedDistrict)) {
          setSelectedDistrict(data[0]);
        }
      } catch (err) {
        console.error("Failed to load districts", err);
      }
    };
    fetchDistricts();
  }, [selectedState]);

  // Load blocks when district changes
  useEffect(() => {
    if (!selectedDistrict) return;
    const fetchBlocks = async () => {
      try {
        const data = await api.getBlocks(selectedDistrict);
        setBlocks(data);
        if (data.length > 0 && !data.includes(selectedBlock)) {
          setSelectedBlock(data[0]);
        }
      } catch (err) {
        console.error("Failed to load blocks", err);
      }
    };
    fetchBlocks();
  }, [selectedDistrict]);

  // Load panchayats when block changes
  useEffect(() => {
    if (!selectedBlock) return;
    const fetchPanchayats = async () => {
      try {
        const data = await api.getPanchayats(selectedBlock);
        setPanchayats(data);
        if (data.length > 0) {
          const match = data.find(p => p.id === selectedLocationId);
          const activeP = match || data[0];
          setSelectedPanchayatId(activeP.id);
          if (onLocationChange) onLocationChange(activeP);
        }
      } catch (err) {
        console.error("Failed to load panchayats", err);
      }
    };
    fetchPanchayats();
  }, [selectedBlock]);

  const handlePanchayatSelect = (e) => {
    const locId = parseInt(e.target.value, 10);
    setSelectedPanchayatId(locId);
    const loc = panchayats.find(p => p.id === locId);
    if (loc && onLocationChange) {
      onLocationChange(loc);
    }
  };

  return (
    <div className="card location-selector-card">
      <div className="selector-title-row">
        <MapPin size={18} className="text-emerald" />
        <h4 className="selector-title">{t('location_title')}</h4>
      </div>

      <div className="cascading-grid">
        {/* State */}
        <div className="form-group">
          <label className="form-label">{t('select_state')}</label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="form-select"
          >
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* District */}
        <div className="form-group">
          <label className="form-label">{t('select_district')}</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="form-select"
          >
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Block */}
        <div className="form-group">
          <label className="form-label">{t('select_block')}</label>
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="form-select"
          >
            {blocks.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {/* Panchayat */}
        <div className="form-group">
          <label className="form-label">{t('select_panchayat')}</label>
          <select
            value={selectedPanchayatId}
            onChange={handlePanchayatSelect}
            className="form-select highlight-select"
          >
            {panchayats.map(p => (
              <option key={p.id} value={p.id}>
                {p.panchayat} (Lat: {p.latitude.toFixed(2)}, Lon: {p.longitude.toFixed(2)})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;
