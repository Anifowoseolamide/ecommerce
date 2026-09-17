import React from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { formatCurrency } from '../data/initialData';

export default function ProductCard({ 
  product, 
  currency = 'NGN', 
  onAddToCart, 
  onQuickView 
}) {
  const formattedPrice = formatCurrency(product.price, currency);

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
          <span className="product-price">{formattedPrice}</span>
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
