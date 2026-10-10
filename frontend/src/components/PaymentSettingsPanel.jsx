import React, { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { fetchCheckoutSettings, saveCheckoutSettings } from '../services/api';

const EMPTY_SETTINGS = { whatsapp_number: '', bank_name: '', account_number: '', account_name: '' };

const FIELDS = [
  ['whatsapp_number', 'WhatsApp number', '08031234567', 'Orders and "Chat with us" messages go to this number.'],
  ['bank_name', 'Bank name', 'e.g. GTBank', ''],
  ['account_number', 'Account number', '0123456789', ''],
  ['account_name', 'Account name', 'SwissMax Beauty Grp Ltd', ''],
];

export default function PaymentSettingsPanel() {
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetchCheckoutSettings()
      .then((saved) => setSettings({ ...EMPTY_SETTINGS, ...saved }))
      .catch((err) => setNotice(`Could not load details: ${err.message}`))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setNotice('');
    try {
      const saved = await saveCheckoutSettings(settings);
      setSettings({ ...EMPTY_SETTINGS, ...saved });
      setNotice('✓ Saved. Customers will see these details after ordering.');
    } catch (err) {
      setNotice(`Not saved: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="dashboard-panel">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', letterSpacing: '0.06em' }}>PAYMENT & WHATSAPP</h2>
      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 24px' }}>
        Shown to customers after they place an order, so they know where to pay and how to reach you.
      </p>

      <form onSubmit={handleSave} style={{ maxWidth: '640px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
          {FIELDS.map(([key, label, placeholder, help]) => (
            <div key={key}>
              <label className="form-label" htmlFor={`checkout-${key}`}>{label}</label>
              <input
                id={`checkout-${key}`}
                className="form-input"
                placeholder={placeholder}
                disabled={isLoading}
                value={settings[key]}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
              />
              {help && <div className="form-help">{help}</div>}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '24px', flexWrap: 'wrap' }}>
          <button type="submit" className="btn-save" disabled={isSaving || isLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px' }}>
            {isSaving ? <Loader2 size={14} className="spinning" /> : <Save size={14} />}
            {isSaving ? 'SAVING…' : 'SAVE DETAILS'}
          </button>
          {notice && <span style={{ fontSize: '12px', fontWeight: '600' }}>{notice}</span>}
        </div>
      </form>
    </div>
  );
}
