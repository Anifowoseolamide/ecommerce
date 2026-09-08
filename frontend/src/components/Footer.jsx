import React, { useState } from 'react';
import swissmaxLogo from '../assets/swissmax-logo.jpg';

export default function Footer({ onSelectCategory }) {
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
          {/* Brand Story */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
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
              SwissMax BEAUTY GRP LIMITED crafts exceptional formulations at the intersection of Swiss cellular science, botanical purity, and haute parfumerie. We curate iconic beauty editions that elevate daily rituals into transcendent experiences.
            </p>
          </div>

          {/* Flagship Disciplines */}
          <div>
            <h4 className="footer-col-title">COLLECTIONS</h4>
            <ul className="footer-links">
              <li>
                <a href="#catalog" onClick={() => onSelectCategory('skincare')}>
                  Skincare Cellular
                </a>
              </li>
              <li>
                <a href="#catalog" onClick={() => onSelectCategory('cosmetics')}>
                  Cosmetics & Complexion
                </a>
              </li>
              <li>
                <a href="#catalog" onClick={() => onSelectCategory('perfume')}>
                  Haute Parfumerie
                </a>
              </li>
              <li>
                <a href="#catalog" onClick={() => onSelectCategory('all')}>
                  All Editions
                </a>
              </li>
            </ul>
          </div>

          {/* Client Services */}
          <div>
            <h4 className="footer-col-title">CLIENT PRIVILEGE</h4>
            <ul className="footer-links">
              <li><a href="#brand-story">Swiss Heritage</a></li>
              <li><a href="#brand-story">Bespoke Consultations</a></li>
              <li><a href="#brand-story">Global Courier Delivery</a></li>
              <li><a href="#brand-story">Authentication Certificate</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="footer-col-title">VIP PRIVATE SALON</h4>
            <p className="footer-text" style={{ marginBottom: '14px' }}>
              Receive privileged access to private archives, limited extrait releases, and private client invitations.
            </p>
            {subscribed ? (
              <p style={{ color: 'var(--color-gold)', fontSize: '12px', fontWeight: '600' }}>
                ✓ You are now enrolled in the SwissMax VIP registry.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    background: '#181A20',
                    border: '1px solid var(--border-dark)',
                    color: '#FFF',
                    padding: '8px 12px',
                    fontSize: '12px',
                    borderRadius: '2px',
                    flexGrow: 1,
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'var(--color-gold)',
                    color: '#0B0C0E',
                    padding: '8px 16px',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.08em',
                    borderRadius: '2px'
                  }}
                >
                  JOIN
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} SwissMax BEAUTY GRP LIMITED. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ color: 'var(--color-gold)' }}>Zurich • Geneva • London • Accra</span>
            <span>Terms of Privilege</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
