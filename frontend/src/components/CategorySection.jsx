import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function CategorySection({ categories, onSelectCategory }) {
  return (
    <section className="categories-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">CURATED COLLECTIONS</span>
          <h2 className="section-title">DISCOVER BY DISCIPLINE</h2>
        </div>

        <div className="categories-grid">
          {categories.map((cat) => (
            <div 
              key={cat.id || cat.slug} 
              className="category-card"
              onClick={() => {
                onSelectCategory(cat.slug);
                const catalogEl = document.getElementById('catalog');
                if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="category-card-img" 
              />
              <div className="category-overlay" />
              
              <div className="category-meta">
                <h3 className="category-card-title">{cat.name}</h3>
                <p className="category-card-desc">{cat.description}</p>
                <span className="category-card-link">
                  VIEW COLLECTION <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
