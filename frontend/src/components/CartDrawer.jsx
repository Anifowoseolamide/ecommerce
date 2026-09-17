import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../data/initialData';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  currency = 'NGN',
  onUpdateQty,
  onRemoveItem,
  onClearCart
}) {
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  if (!isOpen) return null;

  const rawSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = rawSubtotal * (discountPercent / 100);
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'SWISS30' || promoCode.trim().toUpperCase() === 'SALE30') {
      setDiscountPercent(30);
      alert('Coupon applied! 30% off SwissMax order.');
    } else if (promoCode.trim().toUpperCase() === 'GOLD10') {
      setDiscountPercent(10);
      alert('Coupon applied! 10% VIP discount.');
    } else {
      alert('Invalid code. Try "SWISS30" for 30% off.');
    }
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setOrderComplete(true);
      setTimeout(() => {
        onClearCart();
        setOrderComplete(false);
        onClose();
      }, 3000);
    }, 1500);
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title">
            SHOPPING BAG ({cart.reduce((s, i) => s + i.quantity, 0)})
          </div>
          <button onClick={onClose} style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {orderComplete ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', margin: 'auto' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FAF6EF', border: '1.5px solid var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--color-gold)' }}>
              ✓
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '10px' }}>ORDER CONFIRMED</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Thank you for choosing SwissMax Beauty. Your bespoke order has been processed.
            </p>
          </div>
        ) : cart.length === 0 ? (
          <div style={{ padding: '80px 24px', textAlign: 'center', margin: 'auto' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#888', marginBottom: '16px' }}>
              Your shopping bag is empty.
            </p>
            <button
              className="btn-discover"
              onClick={onClose}
              style={{ color: '#000', borderColor: '#000', fontSize: '10px' }}
            >
              CONTINUE BROWSING
            </button>
          </div>
        ) : (
          <>
            <div className="drawer-body">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-details">
                    <h5 className="cart-item-title">{item.name}</h5>
                    <div className="cart-item-price">
                      {formatCurrency(item.price * item.quantity, currency)}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                      <div className="cart-qty-controls">
                        <button
                          className="qty-btn"
                          onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '12px', fontWeight: '600' }}>{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        style={{ color: '#A0A0A0', display: 'flex', alignItems: 'center' }}
                        title="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Promo Code Box */}
              <form onSubmit={handleApplyPromo} style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Coupon (e.g. SWISS30)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '12px', padding: '8px 12px' }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '8px 14px',
                    fontSize: '11px',
                    fontWeight: '600',
                    letterSpacing: '0.08em',
                    background: '#111',
                    color: '#FFF',
                    borderRadius: '2px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  APPLY
                </button>
              </form>
            </div>

            <div className="drawer-footer">
              <div className="subtotal-row" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                <span>Subtotal</span>
                <span>{formatCurrency(rawSubtotal, currency)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="subtotal-row" style={{ color: '#2E7D32', fontSize: '12px' }}>
                  <span>Discount ({discountPercent}%)</span>
                  <span>-{formatCurrency(discountAmount, currency)}</span>
                </div>
              )}
              <div className="subtotal-row" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                <span>Complimentary Shipping</span>
                <span style={{ color: 'var(--color-gold)', fontWeight: '600' }}>FREE</span>
              </div>
              <div className="subtotal-row" style={{ fontSize: '16px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                <span>Total</span>
                <span>{formatCurrency(finalTotal, currency)}</span>
              </div>

              <button 
                className="btn-checkout" 
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? "PROCESSING VIP CHECKOUT..." : `CHECKOUT • ${formatCurrency(finalTotal, currency)}`}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px', fontSize: '10px', color: 'var(--text-muted)' }}>
                <ShieldCheck size={14} color="var(--color-gold)" />
                <span>Encrypted 256-Bit SSL Payment Protection</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
