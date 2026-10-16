import React from 'react';

// 18 Authentic Brand Logos supplied from C:\Users\USER\Pictures\slidingimages
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

export default function BrandMarqueeSection({ onSelectBrand }) {
  // Exact 2x duplication ensures pixel-perfect seamless -50% infinite loop
  const rowOneItems = [...ROW_ONE_BASE, ...ROW_ONE_BASE];
  const rowTwoItems = [...ROW_TWO_BASE, ...ROW_TWO_BASE];

  const handleBrandClick = (brand) => {
    if (brand.isMore) {
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (onSelectBrand) {
      onSelectBrand(brand.name);
    }
  };

  return (
    <section className="brand-marquee-section" id="featured-brands">
      <div className="container">
        {/* Header styled like reference with prominent highlight */}
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

      {/* Marquee Container with smooth edge fades */}
      <div className="brand-marquee-container">
        {/* Row 1 - Sliding Left */}
        <div className="brand-marquee-row" aria-label="Featured Brands Row 1">
          <div className="brand-marquee-track scroll-left">
            {rowOneItems.map((brand, idx) => (
              <div
                key={`r1-${brand.id}-${idx}`}
                className="brand-logo-card"
                onClick={() => handleBrandClick(brand)}
                title={`Browse ${brand.name} collection`}
                role="button"
                tabIndex={0}
              >
                <img
                  src={brand.image}
                  alt={brand.name}
                  className="brand-logo-img"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - Sliding Right */}
        <div className="brand-marquee-row" aria-label="Featured Brands Row 2">
          <div className="brand-marquee-track scroll-right">
            {rowTwoItems.map((brand, idx) => (
              brand.isMore ? (
                <div
                  key={`r2-${brand.id}-${idx}`}
                  className="brand-logo-card brand-logo-more"
                  onClick={() => handleBrandClick(brand)}
                  title="Explore our full collection"
                  role="button"
                  tabIndex={0}
                >
                  <span className="brand-more-text">and more...</span>
                </div>
              ) : (
                <div
                  key={`r2-${brand.id}-${idx}`}
                  className="brand-logo-card"
                  onClick={() => handleBrandClick(brand)}
                  title={`Browse ${brand.name} collection`}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="brand-logo-img"
                    loading="lazy"
                  />
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
