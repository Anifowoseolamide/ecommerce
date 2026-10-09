import React, { useState } from 'react';
import swissmaxLogo from '../assets/swissmax-logo.jpg';

export default function Footer({ onSelectCategory, onOpenAdminLogin }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  return (
    <footer className="site-footer" id="brand-story">
      <div className="container">
        <div className="footer-grid">
          {/* 1st Column: Brand Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <img
                src={swissmaxLogo}
                alt="SwissMax Logo"
                style={{ width: '42px', height: '42px', borderRadius: '50%', border: '1px solid var(--color-gold)' }}
              />
              <span className="footer-brand-title" style={{ marginBottom: 0 }}>
                SwissMax Beauty
              </span>
            </div>
            <p className="footer-text">
              SwissMax Beauty Group LTD curates and imports exceptional, high-in-demand and effective Beauty products directly from original Manufacturers, making them available to our customers at highly competitive prices
            </p>
          </div>

          {/* 2nd Column: Collections */}
          <div>
            <h4 className="footer-col-title">COLLECTIONS</h4>
            <ul className="footer-links">
              <li>
                <a href="#catalog" onClick={() => onSelectCategory('skincare')}>
                  Skincare
                </a>
              </li>
              <li>
                <a href="#catalog" onClick={() => onSelectCategory('cosmetics')}>
                  Cosmetics
                </a>
              </li>
              <li>
                <a href="#catalog" onClick={() => onSelectCategory('perfume')}>
                  Perfumes & Sprays
                </a>
              </li>
            </ul>
          </div>

          {/* 3rd Column: Client Privilege */}
          <div>
            <h4 className="footer-col-title">Client Privilege</h4>
            <ul className="footer-links">
              <li><a href="#brand-story">Consultation</a></li>
              <li><a href="#brand-story">Global Delivery</a></li>
              <li><a href="#brand-story">Monthly Newsletter</a></li>
            </ul>
          </div>

          {/* 4th Column: Resellers Privilege */}
          <div>
            <h4 className="footer-col-title">Resellers Privilege</h4>
            <ul className="footer-links">
              <li><a href="#inventory-archive">Global Delivery</a></li>
              <li><a href="#inventory-archive">Business Consultation</a></li>
              <li><a href="#inventory-archive">Monthly Newsletter</a></li>
              <li><a href="#inventory-archive">Market Trend Update</a></li>
              <li><a href="#inventory-archive">Supplier access</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Left, Middle, Right */}
        <div className="footer-bottom">
          <span style={{ fontSize: '11px' }}>
            @2026 SWISSMAX BEAUTY GRP LIMITED. All rights reserved
          </span>
          <span style={{ color: 'var(--color-gold)', fontWeight: '600', letterSpacing: '0.08em', fontSize: '11px' }}>
            Designed by AIPS
          </span>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-light-muted)', fontSize: '11px' }}>
              Lagos. Abuja. Accra. Freetown
            </span>
            <button
              onClick={onOpenAdminLogin}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.35)',
                fontSize: '10px',
                cursor: 'pointer',
                letterSpacing: '0.04em',
                transition: 'color 0.2s',
                padding: '0 4px',
              }}
              onMouseEnter={(e) => (e.target.style.color = 'var(--color-gold)')}
              onMouseLeave={(e) => (e.target.style.color = 'rgba(255, 255, 255, 0.35)')}
              title="Staff Admin Access"
            >
              🔒 Staff
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
