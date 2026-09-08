import React, { useState } from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({
  products,
  categories,
  activeCategory,
  onSelectCategory,
  currency,
  onAddToCart,
  onQuickView,
  searchQuery
}) {
  const [sortBy, setSortBy] = useState('featured');

  // Filter by category
  let filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category_slug === activeCategory);

  // Filter by search query if any
  if (searchQuery && searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.category_name.toLowerCase().includes(q)
    );
  }

  // Sort
  if (sortBy === 'price-low') {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  }

  return (
    <section className="catalog-section" id="catalog">
      <div className="container">
        <div className="section-header">
          <span className="section-label">SWISS PRECISION FORMULATIONS</span>
          <h2 className="section-title">FEATURED EDITIONS</h2>
        </div>

        {/* Filter and Sort Bar */}
        <div className="filter-bar">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => onSelectCategory('all')}
            >
              ALL ITEMS ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter(p => p.category_slug === cat.slug).length;
              return (
                <button
                  key={cat.slug}
                  className={`filter-tab ${activeCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => onSelectCategory(cat.slug)}
                >
                  {cat.name.toUpperCase()} ({count})
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '11px', fontWeight: '600' }}
            >
              <option value="featured">Featured Collection</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filtered.length > 0 ? (
          <div className="product-grid">
            {filtered.map((prod) => (
              <ProductCard
                key={prod.id || prod.slug}
                product={prod}
                currency={currency}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FAFAFA', border: '1px solid var(--border-light)' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#666', marginBottom: '8px' }}>
              No products found for this selection.
            </p>
            <button
              className="btn-discover"
              onClick={() => onSelectCategory('all')}
              style={{ color: '#000', borderColor: '#000', marginTop: '10px' }}
            >
              SHOW ALL EDITIONS
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
