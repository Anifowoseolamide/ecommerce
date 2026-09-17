import React from 'react';
import { Award, ShieldCheck, Droplet, Sparkles, Truck } from 'lucide-react';
import { HERITAGE_FEATURE } from '../data/initialData';

export default function HeritageSection({ onExploreClick }) {
  return (
    <section className="heritage-section" id="brand-story">
      <div className="container">
        <div className="heritage-grid">
          {/* Visual Editorial Image */}
          <div className="heritage-image-wrapper">
            <img 
              src={HERITAGE_FEATURE.image} 
              alt="SwissMax Beauty Tradefair Lagos" 
              className="heritage-img"
            />
            <div className="heritage-image-badge">
              <Sparkles size={16} color="var(--color-gold)" />
              <span>{HERITAGE_FEATURE.badge_text || "SwissMax Beauty . Tradefair, Lagos"}</span>
            </div>
          </div>

          {/* Editorial Content */}
          <div className="heritage-content">
            <span className="section-label">{HERITAGE_FEATURE.subtitle}</span>
            <h2 className="heritage-title">{HERITAGE_FEATURE.title}</h2>
            <p className="heritage-body">{HERITAGE_FEATURE.body}</p>

            {/* Stats / Trust Badges */}
            <div className="heritage-stats-grid">
              {HERITAGE_FEATURE.stats.map((st, idx) => (
                <div key={idx} className="heritage-stat-card">
                  <span className="heritage-stat-val">{st.value}</span>
                  <span className="heritage-stat-lbl">{st.label}</span>
                </div>
              ))}
            </div>

            {/* Pillar Badges */}
            <div className="heritage-pillars">
              <div className="heritage-pillar-item">
                <ShieldCheck size={16} color="var(--color-gold)" />
                <span>Certified distributor of over 30 OPM</span>
              </div>
              <div className="heritage-pillar-item">
                <Truck size={16} color="var(--color-gold)" />
                <span>Western Africa wide Delivery</span>
              </div>
              <div className="heritage-pillar-item">
                <Award size={16} color="var(--color-gold)" />
                <span>Thailand, Korea, USA Products.</span>
              </div>
            </div>

            <button 
              className="btn-discover"
              onClick={onExploreClick}
              style={{ color: '#000', borderColor: '#000', marginTop: '24px' }}
            >
              EXPLORE OUR PRODUCTS
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
