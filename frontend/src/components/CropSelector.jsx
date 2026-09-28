import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Sprout } from 'lucide-react';

const cropEmojis = {
  "Paddy": "🌾",
  "Millets (Ragi/Bajra)": "🌾",
  "Groundnut": "🥜",
  "Cotton": "🌱",
  "Sugarcane": "🎋",
  "Black Gram (Pulses)": "🫘",
  "Maize": "🌽"
};

const CropSelector = ({ selectedCropId = 1, onCropChange }) => {
  const { t, language } = useLanguage();
  const [crops, setCrops] = useState([]);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const data = await api.getCrops();
        setCrops(data);
      } catch (err) {
        console.error("Failed to load crops", err);
      }
    };
    fetchCrops();
  }, []);

  const handleChange = (e) => {
    const cropId = parseInt(e.target.value, 10);
    const cropObj = crops.find(c => c.id === cropId);
    if (onCropChange) {
      onCropChange(cropId, cropObj);
    }
  };

  return (
    <div className="card crop-selector-card">
      <div className="selector-title-row">
        <Sprout size={18} className="text-emerald" />
        <h4 className="selector-title">{t('select_crop')}</h4>
      </div>

      <div className="crop-pills-row">
        {crops.map((crop) => {
          const isSelected = crop.id === selectedCropId;
          const emoji = cropEmojis[crop.name] || "🌱";
          return (
            <button
              key={`crop-${crop.id}`}
              type="button"
              className={`crop-pill ${isSelected ? 'active' : ''}`}
              onClick={() => onCropChange && onCropChange(crop.id, crop)}
            >
              <span className="crop-emoji">{emoji}</span>
              <span className="crop-name">
                {language === 'ta' ? crop.tamil_name : crop.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CropSelector;
