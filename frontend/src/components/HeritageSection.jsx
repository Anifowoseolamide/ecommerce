import React from 'react';
import { Award, ShieldCheck, Droplet, Sparkles, Truck } from 'lucide-react';
import { HERITAGE_FEATURE } from '../data/initialData';

export default function HeritageSection({ heritage = HERITAGE_FEATURE, onExploreClick }) {
  const data = heritage || HERITAGE_FEATURE;
  const stats = data.stats && data.stats.length > 0 ? data.stats : HERITAGE_FEATURE.stats;
  const pillars = data.pillars && data.pillars.length > 0 ? data.pillars : HERITAGE_FEATURE.pillars;
  const pillarIcons = [ShieldCheck, Truck, Award];

  return (
    <section className="heritage-section" id="brand-story">
      <div className="container">
        <div className="heritage-grid">
          {/* Visual Editorial Image */}
          <div className="heritage-image-wrapper">
            <img 
              src={data.image || HERITAGE_FEATURE.image} 
              alt={data.title || "SwissMax Beauty Tradefair Lagos"} 
              className="heritage-img"
            />
            <div className="heritage-image-badge">
              <Sparkles size={16} color="var(--color-gold)" />
              <span>{data.badge_text || "SwissMax Beauty . Tradefair, Lagos"}</span>
            </div>
          </div>

          {/* Editorial Content */}
          <div className="heritage-content">
            <span className="section-label">{data.subtitle}</span>
            <h2 className="heritage-title">{data.title}</h2>
            <p className="heritage-body">{data.body}</p>

            {/* Stats / Trust Badges */}
            <div className="heritage-stats-grid">
              {stats.map((st, idx) => (
                <div key={idx} className="heritage-stat-card">
                  <span className="heritage-stat-val">{st.value}</span>
                  <span className="heritage-stat-lbl">{st.label}</span>
                </div>
              ))}
            </div>

            {/* Pillar Badges */}
            <div className="heritage-pillars">
              {pillars.map((pillar, idx) => {
                const IconComponent = pillarIcons[idx % pillarIcons.length];
                return (
                  <div key={idx} className="heritage-pillar-item">
                    <IconComponent size={16} color="var(--color-gold)" />
                    <span>{pillar}</span>
                  </div>
                );
              })}
            </div>

            <button 
              className="btn-discover"
              onClick={onExploreClick}
              style={{ color: '#000', borderColor: '#000', marginTop: '24px' }}
            >
              {data.button_text || "EXPLORE OUR PRODUCTS"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
