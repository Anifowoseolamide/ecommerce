import React, { useState } from 'react';
import ProductCard from './ProductCard';
import Pagination from './Pagination';
import usePagedList, { useDebounced } from '../hooks/usePagedList';
import { fetchProductsPage } from '../services/api';

const PAGE_SIZE = 12;

export default function ProductGrid({
  categories,
  activeCategory,
  onSelectCategory,
  currency,
  onAddToCart,
  onQuickView,
  searchQuery
}) {
  const [sortBy, setSortBy] = useState('featured');
  const search = useDebounced((searchQuery || '').trim(), 300);

  // The server filters, searches, sorts and returns one page at a time
  const { items, pagination, counts, isLoading, error, setPage, reload } = usePagedList(
    fetchProductsPage,
    { category: activeCategory === 'all' ? '' : activeCategory, q: search, sort: sortBy },
    PAGE_SIZE
  );

  const handlePageChange = (next) => {
    setPage(next);
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const countLabel = (value) => (value === undefined || value === null ? '…' : value);

  return (
    <section className="catalog-section" id="catalog">
      <div className="container">
        <div className="section-header">
          <span className="section-label">SWISSMAX BEAUTY TOP PICKS</span>
          <h2 className="section-title">FEATURED PRODUCTS</h2>
        </div>

        {/* Filter and Sort Bar */}
        <div className="filter-bar">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => onSelectCategory('all')}
            >
              ALL ITEMS ({countLabel(counts?.all)})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                className={`filter-tab ${activeCategory === cat.slug ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.slug)}
              >
                {cat.name.toUpperCase()} ({countLabel(counts ? (counts[cat.slug] || 0) : undefined)})
              </button>
            ))}
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
        {items.length > 0 ? (
          <div className="product-grid" style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.15s' }}>
            {items.map((prod) => (
              <ProductCard
                key={prod.id || prod.slug}
                product={prod}
                currency={currency}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        ) : isLoading ? (
          <div className="product-grid">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} style={{ border: '1px solid var(--border-light)', background: '#FAFAFA', minHeight: '340px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.5 }}>
                <div style={{ width: '100%', height: '220px', background: '#EAEAEA', borderRadius: '2px' }} />
                <div style={{ width: '35%', height: '10px', background: '#E0E0E0', borderRadius: '2px' }} />
                <div style={{ width: '70%', height: '16px', background: '#E5E5E5', borderRadius: '2px' }} />
                <div style={{ width: '30%', height: '14px', background: '#E0E0E0', borderRadius: '2px', marginTop: 'auto' }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FAFAFA', border: '1px solid var(--border-light)' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#666', marginBottom: '8px' }}>
              We couldn't load the products.
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{error}</p>
            <button className="btn-discover" onClick={reload} style={{ color: '#000', borderColor: '#000', marginTop: '14px' }}>
              TRY AGAIN
            </button>
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

        <Pagination pagination={pagination} onPageChange={handlePageChange} disabled={isLoading} noun="products" />
      </div>
    </section>
  );
}
