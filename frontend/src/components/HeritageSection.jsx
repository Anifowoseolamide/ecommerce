import React from 'react';
import { Award, ShieldCheck, Droplet, Sparkles } from 'lucide-react';
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
              alt="Swiss Alpine Botanical Heritage" 
              className="heritage-img"
            />
            <div className="heritage-image-badge">
              <Sparkles size={16} color="var(--color-gold)" />
              <span>SWISS CELLULAR LABORATORY • ZURICH</span>
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
                <span>Certified Swiss Alpine Purity</span>
              </div>
              <div className="heritage-pillar-item">
                <Droplet size={16} color="var(--color-gold)" />
                <span>Glacial Bio-Fermented Extracts</span>
              </div>
              <div className="heritage-pillar-item">
                <Award size={16} color="var(--color-gold)" />
                <span>Haute Parfumerie Master Formulations</span>
              </div>
            </div>

            <button 
              className="btn-discover"
              onClick={onExploreClick}
              style={{ color: '#000', borderColor: '#000', marginTop: '24px' }}
            >
              EXPLORE OUR FORMULATIONS
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
