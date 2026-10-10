import React, { useEffect, useState } from 'react';
import { RefreshCw, Phone, MessageCircle } from 'lucide-react';
import { formatCurrency } from '../data/initialData';
import { fetchOrders, updateOrderStatus } from '../services/api';
import { whatsAppLink } from '../utils/whatsapp';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: '#B26A00', background: '#FFF4E0' },
  { value: 'paid', label: 'Paid', color: '#1565C0', background: '#E8F1FB' },
  { value: 'delivered', label: 'Delivered', color: '#2E7D32', background: '#E8F5E9' },
  { value: 'cancelled', label: 'Cancelled', color: '#757575', background: '#F2F2F2' },
];

const headingStyle = { fontFamily: 'var(--font-display)', fontSize: '18px', letterSpacing: '0.06em' };
const smallLabelStyle = { fontSize: '10px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' };

// onOrdersChange lets the sidebar keep its new-orders badge in sync
export default function OrdersPanel({ onOrdersChange }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadAll = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      setOrders(await fetchOrders());
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (onOrdersChange) onOrdersChange(orders);
  }, [orders]);

  const handleStatusChange = async (orderId, status) => {
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      alert(`Status was NOT updated: ${err.message}`);
    }
  };

  const visibleOrders = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);
  const newCount = orders.filter((o) => o.status === 'new').length;

  return (
    <div className="dashboard-panel">
      {/* Orders list */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
        <div>
          <h2 style={headingStyle}>CUSTOMER ORDERS</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {newCount} new order{newCount === 1 ? '' : 's'} waiting. Mark orders as paid once the transfer arrives.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="all">All orders ({orders.length})</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label} ({orders.filter((o) => o.status === s.value).length})</option>
            ))}
          </select>
          <button type="button" onClick={loadAll} disabled={isLoading} title="Refresh orders"
            style={{ padding: '9px 12px', border: '1px solid var(--border-light)', background: '#FFF', borderRadius: '2px', display: 'flex', alignItems: 'center' }}>
            <RefreshCw size={15} className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {loadError && (
        <div style={{ background: '#FDECEA', color: '#B3261E', fontSize: '13px', padding: '12px 14px', borderRadius: '2px', marginBottom: '16px' }}>
          Could not load orders: {loadError}
        </div>
      )}

      {!isLoading && !loadError && visibleOrders.length === 0 && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '30px 0', textAlign: 'center' }}>
          No orders yet.
        </p>
      )}

      <div style={{ display: 'grid', gap: '14px' }}>
        {visibleOrders.map((order) => {
          const status = STATUS_OPTIONS.find((s) => s.value === order.status) || STATUS_OPTIONS[0];
          return (
            <div key={order.id} style={{ border: '1px solid var(--border-light)', borderRadius: '3px', padding: '18px', background: '#FFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '14px', letterSpacing: '0.06em' }}>{order.reference}</strong>
                    <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: '10px', color: status.color, background: status.background }}>
                      {status.label.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {new Date(order.created_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '17px', fontWeight: '800' }}>{formatCurrency(order.total, 'NGN')}</div>
                  <select
                    className="form-select"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    style={{ width: 'auto', marginTop: '6px', fontSize: '12px', padding: '6px 10px' }}
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
                <div>
                  <div style={smallLabelStyle}>Customer</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginTop: '4px' }}>{order.customer_name}</div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '12px' }}>
                    <a href={`tel:${order.customer_phone}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#333' }}>
                      <Phone size={12} /> {order.customer_phone}
                    </a>
                    <a href={whatsAppLink(order.customer_phone, `Hello ${order.customer_name}, this is SwissMax Beauty about your order ${order.reference}.`)}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#1DA851', fontWeight: '600' }}>
                      <MessageCircle size={12} /> WhatsApp
                    </a>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', whiteSpace: 'pre-line' }}>{order.delivery_address}</div>
                  {order.note && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', fontStyle: 'italic' }}>Note: {order.note}</div>
                  )}
                </div>
                <div>
                  <div style={smallLabelStyle}>Items</div>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '12px', marginTop: '4px' }}>
                      <span>{item.name} × {item.quantity}</span>
                      <span style={{ fontWeight: '600', whiteSpace: 'nowrap' }}>{formatCurrency(item.line_total, 'NGN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
