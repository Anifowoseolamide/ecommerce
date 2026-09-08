import React, { useState } from 'react';
import { X, Check, ShieldCheck, Truck, Sparkles } from 'lucide-react';

const CURRENCY_RATES = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  CHF: { symbol: 'CHF ', rate: 0.88 },
  GHS: { symbol: '₵', rate: 15.5 },
};

export default function ProductModal({ product, currency, onClose, onAddToCart }) {
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Standard');

  if (!product) return null;

  const { symbol, rate } = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const formattedPrice = (product.price * rate).toFixed(2);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-img-col">
          <img src={product.image} alt={product.name} className="modal-img" />
        </div>

        <div className="modal-info-col">
          <span style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: '600', marginBottom: '6px' }}>
            {product.category_name}
          </span>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: '500', lineHeight: '1.25', marginBottom: '12px' }}>
            {product.name}
          </h2>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#111', marginBottom: '18px' }}>
            {symbol}{formattedPrice}
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '24px' }}>
            {product.description}
          </p>

          {/* Size / Format Selection */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{ display: 'block', fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Select Specification:
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['Standard 50ml', 'Signature 100ml'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  style={{
                    padding: '8px 14px',
                    fontSize: '11px',
                    fontWeight: '600',
                    border: selectedSize === sz ? '1.5px solid var(--color-gold)' : '1px solid var(--border-light)',
                    background: selectedSize === sz ? '#FAF6EF' : '#FFF',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Add to Bag */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-light)', borderRadius: '2px' }}>
              <button 
                onClick={() => setQty(Math.max(1, qty - 1))}
                style={{ padding: '10px 14px', fontSize: '14px', fontWeight: '600' }}
              >
                -
              </button>
              <span style={{ padding: '0 12px', fontSize: '13px', fontWeight: '600' }}>{qty}</span>
              <button 
                onClick={() => setQty(qty + 1)}
                style={{ padding: '10px 14px', fontSize: '14px', fontWeight: '600' }}
              >
                +
              </button>
            </div>

            <button
              className="btn-checkout"
              style={{ flexGrow: 1 }}
              onClick={() => {
                onAddToCart(product, qty);
                onClose();
              }}
            >
              ADD TO BAG • {symbol}{(product.price * rate * qty).toFixed(2)}
            </button>
          </div>

          {/* Guarantees */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={15} color="var(--color-gold)" />
              <span>100% Authentic Formulation • Laboratory Certified</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
              <Truck size={15} color="var(--color-gold)" />
              <span>Complimentary worldwide luxury courier shipping</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
