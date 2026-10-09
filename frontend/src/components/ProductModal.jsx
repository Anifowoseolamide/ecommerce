import React, { useState } from 'react';
import { X, Check, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { formatCurrency } from '../data/initialData';

export default function ProductModal({ product, currency = 'NGN', onClose, onAddToCart }) {
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const formattedPrice = formatCurrency(product.price, currency);

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
            {formattedPrice}
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '24px' }}>
            {product.description}
          </p>

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
              ADD TO BAG • {formatCurrency(product.price * qty, currency)}
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
