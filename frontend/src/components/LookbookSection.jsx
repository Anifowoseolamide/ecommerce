import React, { useEffect, useState } from 'react';
import { fetchArticles, getCachedArticles } from '../services/api';

export default function LookbookSection({ onSelectCategory }) {
  // Show the last-known articles straight away, then refresh from the server
  const [articles, setArticles] = useState(getCachedArticles);

  useEffect(() => {
    let cancelled = false;
    fetchArticles().then((latest) => {
      if (!cancelled) setArticles(latest);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // All articles deleted in the admin: hide the section rather than show an empty heading
  if (articles.length === 0) return null;

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
          {articles.map((item) => (
            <div key={item.id} className="lookbook-card" onClick={() => onSelectCategory('all')}>
              <img src={item.image} alt={item.title} className="lookbook-card-img" />
              <div className="lookbook-card-overlay" />
              <div className="lookbook-card-content">
                {item.subtitle && <span className="lookbook-card-sub">{item.subtitle}</span>}
                <h3 className="lookbook-card-title">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
