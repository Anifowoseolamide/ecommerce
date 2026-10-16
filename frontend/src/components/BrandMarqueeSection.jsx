import React from 'react';

// 18 authentic brand logos supplied from C:\Users\USER\Pictures\slidingimages (resized copies in /public/brands)
const ROW_ONE_BASE = [
  { id: 'cerave', name: 'CeraVe', image: '/brands/brand-17.jpg' },
  { id: 'cosrx', name: 'COSRX', image: '/brands/brand-11.jpg' },
  { id: 'simple', name: 'Simple', image: '/brands/brand-4.jpg' },
  { id: 'nivea', name: 'NIVEA', image: '/brands/brand-15.jpg' },
  { id: 'panoxyl', name: 'PanOxyl', image: '/brands/brand-6.jpg' },
  { id: 'biore', name: 'Bioré', image: '/brands/brand-9.jpg' },
  { id: 'dr-teals', name: "Dr Teal's", image: '/brands/brand-18.jpg' },
  { id: 'vaseline', name: 'Vaseline', image: '/brands/brand-14.jpg' },
  { id: 'tiam', name: 'TIAM', image: '/brands/brand-1.jpg' },
];

const ROW_TWO_BASE = [
  { id: 'dr-rashel', name: 'DR·RASHEL', image: '/brands/brand-10.jpg' },
  { id: 'kojiesan', name: 'Kojie San', image: '/brands/brand-8.jpg' },
  { id: 'disaar', name: 'Disaar Beauty Skincare', image: '/brands/brand-2.jpg' },
  { id: 'facefacts', name: 'Face Facts', image: '/brands/brand-13.jpg' },
  { id: 'dr-davey', name: 'DR. DAVEY', image: '/brands/brand-16.jpg' },
  { id: 'estelin', name: 'ESTELIN', image: '/brands/brand-7.jpg' },
  { id: 'roushun', name: 'Roushun', image: '/brands/brand-5.jpg' },
  { id: 'dr-meinaier', name: 'DR·MEINAIER', image: '/brands/brand-12.jpg' },
  { id: 'tiam-alt', name: 'TIAM Skincare', image: '/brands/brand-3.jpg' },
  { id: 'and-more', name: 'and more...', isMore: true },
];

// The track holds COPIES identical sets and slides by exactly one set (see .partner-track in index.css),
// so the loop is seamless even on very wide screens where a single set is narrower than the viewport.
const COPIES = 4;

function MarqueeRow({ items, direction, label, onSelect }) {
  return (
    <div className="partner-row" aria-label={label}>
      <div className={`partner-track slide-${direction}`}>
        {Array.from({ length: COPIES }, (_, copy) =>
          items.map((brand) => {
            const isDuplicate = copy > 0;
            return (
              <div
                key={`${copy}-${brand.id}`}
                className={`partner-logo ${brand.isMore ? 'partner-logo-more' : ''}`}
                role="button"
                // Only the first copy is reachable by keyboard / screen readers
                tabIndex={isDuplicate ? -1 : 0}
                aria-hidden={isDuplicate ? 'true' : undefined}
                title={brand.isMore ? 'Explore our full collection' : `Browse ${brand.name} collection`}
                onClick={() => onSelect(brand)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(brand);
                  }
                }}
              >
                {brand.isMore ? (
                  <span className="partner-more-text">and more...</span>
                ) : (
                  <img src={brand.image} alt={isDuplicate ? '' : brand.name} className="partner-logo-img" decoding="async" draggable="false" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function BrandMarqueeSection({ onSelectBrand }) {
  const handleSelect = (brand) => {
    if (brand.isMore) {
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (onSelectBrand) onSelectBrand(brand.name);
  };

  return (
    <section className="brand-marquee-section" id="featured-brands">
      <div className="container">
        <div className="brand-marquee-header">
          <span className="section-label">AUTHENTIC & CERTIFIED PARTNERS</span>
          <h2 className="brand-marquee-title">
            Trusted by over <span className="brand-marquee-highlight">100,000+ customers</span> across Nigeria
          </h2>
          <p className="brand-marquee-subtitle">
            Curating iconic beauty & skincare brands sourced directly from original manufacturers
          </p>
        </div>
      </div>

      <div className="brand-marquee-container">
        <MarqueeRow items={ROW_ONE_BASE} direction="left" label="Featured brands, row 1" onSelect={handleSelect} />
        <MarqueeRow items={ROW_TWO_BASE} direction="right" label="Featured brands, row 2" onSelect={handleSelect} />
      </div>
    </section>
  );
}
