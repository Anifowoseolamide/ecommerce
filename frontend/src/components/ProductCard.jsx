import React from 'react';
import { ArrowRight, Plus } from 'lucide-react';

const CURRENCY_RATES = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  CHF: { symbol: 'CHF ', rate: 0.88 },
  GHS: { symbol: '₵', rate: 15.5 },
};

export default function ProductCard({ 
  product, 
  currency = 'USD', 
  onAddToCart, 
  onQuickView 
}) {
  const { symbol, rate } = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const formattedPrice = (product.price * rate).toFixed(2);

  return (
    <div className="product-card">
      <div className="product-img-wrap" onClick={() => onQuickView(product)}>
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-img"
          loading="lazy"
        />
        {product.tag && (
          <span className="product-tag">{product.tag}</span>
        )}
        <button 
          className="product-quick-add"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
        >
          <Plus size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
          ADD TO BAG
        </button>
      </div>

      <div className="product-info">
        <span className="product-cat">{product.category_name}</span>
        <h4 className="product-title" onClick={() => onQuickView(product)}>
          {product.name}
        </h4>
        <p className="product-desc">{product.description}</p>

        <div className="product-footer-row">
          <span className="product-price">{symbol}{formattedPrice}</span>
          <button 
            className="view-details-btn" 
            onClick={() => onQuickView(product)}
            title="View Details"
          >
            DETAILS <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
