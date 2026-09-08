import React from 'react';
import { EDITORIAL_LOOKBOOK } from '../data/initialData';

export default function LookbookSection({ onSelectCategory }) {
  return (
    <section className="lookbook-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">THE SWISSMAX ARCHIVE</span>
          <h2 className="section-title">EDITORIAL LOOKBOOK & CAMPAIGNS</h2>
        </div>

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
