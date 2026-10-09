import React from 'react';
import { EDITORIAL_LOOKBOOK } from '../data/initialData';

export default function LookbookSection({ onSelectCategory }) {
  return (
    <section className="lookbook-section" id="inventory-archive">
      <div className="container">
        {/* Section Header as requested */}
        <div className="section-header">
          <span className="section-label">Swissmax beauty archive</span>
          <h2 className="section-title">Articles</h2>
        </div>

        {/* Editorial Lookbook Cards */}
        <div className="lookbook-grid">
          {EDITORIAL_LOOKBOOK.map((item) => (
            <div key={item.id} className="lookbook-card" onClick={() => onSelectCategory('all')}>
              <img src={item.image} alt={item.title} className="lookbook-card-img" />
              <div className="lookbook-card-overlay" />
              <div className="lookbook-card-content">
                <span className="lookbook-card-sub">{item.subtitle}</span>
                <h3 className="lookbook-card-title">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
