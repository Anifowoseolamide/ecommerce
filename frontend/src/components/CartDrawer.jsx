import React, { useState } from 'react';
import { X, Trash2, ArrowLeft, Landmark, MessageCircle } from 'lucide-react';
import { formatCurrency } from '../data/initialData';
import { placeOrder } from '../services/api';
import { whatsAppLink } from '../utils/whatsapp';

const EMPTY_DETAILS = { name: '', phone: '', address: '', note: '' };

// Message the customer sends to the business on WhatsApp after ordering
function formatOrderMessage(order) {
  const lines = order.items.map(
    (item) => `- ${item.name} x ${item.quantity} = ${formatCurrency(item.line_total, 'NGN')}`
  );
  return [
    'Hello SwissMax Beauty, I just placed an order on your website.',
    '',
    `Order: ${order.reference}`,
    ...lines,
    `Total: ${formatCurrency(order.total, 'NGN')}`,
    '',
    `Name: ${order.customer_name}`,
    `Phone: ${order.customer_phone}`,
    `Address: ${order.delivery_address}`,
    ...(order.note ? [`Note: ${order.note}`] : []),
  ].join('\n');
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  currency = 'NGN',
  onUpdateQty,
  onRemoveItem,
  onClearCart
}) {
  const [step, setStep] = useState('bag'); // 'bag' | 'details'
  const [details, setDetails] = useState(EMPTY_DETAILS);
  const [isPlacing, setIsPlacing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  // { order, payment } once the backend has saved the order
  const [placedOrder, setPlacedOrder] = useState(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleClose = () => {
    if (placedOrder) {
      setPlacedOrder(null);
      setStep('bag');
    }
    setErrorMsg('');
    onClose();
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isPlacing) return;
    setIsPlacing(true);
    setErrorMsg('');
    try {
      const result = await placeOrder(details, cart);
      setPlacedOrder(result);
      setDetails(EMPTY_DETAILS);
      onClearCart();
    } catch (err) {
      if (err.unavailable && err.unavailable.length > 0) {
        err.unavailable.forEach((id) => onRemoveItem(id));
        setStep('bag');
      }
      setErrorMsg(err.message);
    } finally {
      setIsPlacing(false);
    }
  };

  const errorBox = errorMsg && (
    <div style={{ background: '#FDECEA', color: '#B3261E', fontSize: '12px', lineHeight: '1.5', padding: '10px 12px', borderRadius: '2px', marginBottom: '14px' }}>
      {errorMsg}
    </div>
  );

  let content;
  if (placedOrder) {
    const { order, payment } = placedOrder;
    const hasBankDetails = payment && payment.account_number;
    const hasWhatsApp = payment && payment.whatsapp_number;
    content = (
      <div className="drawer-body" style={{ textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FAF6EF', border: '1.5px solid var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px auto', color: 'var(--color-gold)' }}>
          ✓
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '6px' }}>ORDER RECEIVED</h3>
        <p style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.08em', marginBottom: '10px' }}>{order.reference}</p>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
          Thank you, {order.customer_name}. Your order total is <strong>{formatCurrency(order.total, 'NGN')}</strong>.
        </p>

        {hasBankDetails ? (
          <div style={{ textAlign: 'left', border: '1px solid var(--border-light)', background: '#FAFAFA', padding: '16px', borderRadius: '2px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', marginBottom: '12px' }}>
              <Landmark size={15} color="var(--color-gold)" /> PAY BY BANK TRANSFER
            </div>
            {[
              ['Amount', formatCurrency(order.total, 'NGN')],
              ['Bank', payment.bank_name],
              ['Account number', payment.account_number],
              ['Account name', payment.account_name],
            ].map(([label, value]) => (
              <div key={label} className="subtotal-row" style={{ fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <strong style={{ textAlign: 'right' }}>{value}</strong>
              </div>
            ))}
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Use <strong>{order.reference}</strong> as your transfer reference.
            </p>
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
            We'll contact you on {order.customer_phone} to confirm payment and delivery.
          </p>
        )}

        {hasWhatsApp && (
          <>
            <a
              href={whatsAppLink(payment.whatsapp_number, formatOrderMessage(order))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-checkout"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', background: '#25D366', borderColor: '#25D366', color: '#FFF' }}
            >
              <MessageCircle size={16} /> SEND ORDER ON WHATSAPP
            </a>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '8px 0 20px' }}>
              Send us your order on WhatsApp so we can confirm delivery.
            </p>
          </>
        )}

        <button className="btn-discover" onClick={handleClose} style={{ color: '#000', borderColor: '#000', fontSize: '10px' }}>
          CONTINUE BROWSING
        </button>
      </div>
    );
  } else if (cart.length === 0) {
    content = (
      <div style={{ padding: '80px 24px', textAlign: 'center', margin: 'auto' }}>
        {errorBox}
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#888', marginBottom: '16px' }}>
          Your shopping bag is empty.
        </p>
        <button
          className="btn-discover"
          onClick={handleClose}
          style={{ color: '#000', borderColor: '#000', fontSize: '10px' }}
        >
          CONTINUE BROWSING
        </button>
      </div>
    );
  } else if (step === 'details') {
    content = (
      <>
        <form id="checkout-form" className="drawer-body" onSubmit={handlePlaceOrder}>
          <button
            type="button"
            onClick={() => { setStep('bag'); setErrorMsg(''); }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '18px' }}
          >
            <ArrowLeft size={14} /> BACK TO BAG
          </button>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', letterSpacing: '0.08em', marginBottom: '18px' }}>DELIVERY DETAILS</h4>
          {errorBox}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="checkout-name">Full name</label>
            <input id="checkout-name" className="form-input" required autoComplete="name" maxLength={200}
              value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="checkout-phone">Phone (WhatsApp)</label>
            <input id="checkout-phone" className="form-input" type="tel" required autoComplete="tel" maxLength={40}
              placeholder="0803 123 4567"
              value={details.phone} onChange={(e) => setDetails({ ...details, phone: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="checkout-address">Delivery address</label>
            <textarea id="checkout-address" className="form-textarea" rows={3} required autoComplete="street-address" maxLength={1000}
              value={details.address} onChange={(e) => setDetails({ ...details, address: e.target.value })} />
          </div>
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label className="form-label" htmlFor="checkout-note">Note (optional)</label>
            <textarea id="checkout-note" className="form-textarea" rows={2} maxLength={2000}
              placeholder="Delivery instructions, preferred time…"
              value={details.note} onChange={(e) => setDetails({ ...details, note: e.target.value })} />
          </div>
        </form>

        <div className="drawer-footer">
          <div className="subtotal-row" style={{ fontSize: '16px' }}>
            <span>Total</span>
            <span>{formatCurrency(subtotal, 'NGN')}</span>
          </div>
          <button type="submit" form="checkout-form" className="btn-checkout" disabled={isPlacing}>
            {isPlacing ? 'PLACING ORDER…' : `PLACE ORDER • ${formatCurrency(subtotal, 'NGN')}`}
          </button>
          <p style={{ textAlign: 'center', marginTop: '12px', fontSize: '10px', color: 'var(--text-muted)' }}>
            Pay by bank transfer after placing your order.
          </p>
        </div>
      </>
    );
  } else {
    content = (
      <>
        <div className="drawer-body">
          {errorBox}
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
        </div>

        <div className="drawer-footer">
          <div className="subtotal-row" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal, currency)}</span>
          </div>
          <div className="subtotal-row" style={{ fontSize: '16px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
            <span>Total</span>
            <span>{formatCurrency(subtotal, currency)}</span>
          </div>

          <button className="btn-checkout" onClick={() => { setStep('details'); setErrorMsg(''); }}>
            {`CHECKOUT • ${formatCurrency(subtotal, currency)}`}
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="drawer-backdrop" onClick={handleClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title">
            {placedOrder ? 'ORDER PLACED' : `SHOPPING BAG (${cart.reduce((s, i) => s + i.quantity, 0)})`}
          </div>
          <button onClick={handleClose} style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>
        {content}
      </div>
    </div>
  );
}
