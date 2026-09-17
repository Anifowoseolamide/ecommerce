import React, { useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import swissmaxLogo from '../assets/swissmax-logo.jpg';
import { loginAdmin } from '../services/api';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await loginAdmin(username, password);
      if (res && res.success) {
        if (rememberMe) {
          localStorage.setItem('swissmax_admin_auth', JSON.stringify({
            username: res.user.username,
            timestamp: Date.now()
          }));
        } else {
          sessionStorage.setItem('swissmax_admin_auth', JSON.stringify({
            username: res.user.username,
            timestamp: Date.now()
          }));
        }
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res?.error || 'Invalid credentials or non-admin account.');
      }
    } catch (err) {
      setErrorMsg('Could not verify credentials with backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(9, 13, 22, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        background: '#ffffff',
        borderRadius: '24px',
        border: '1.5px solid #eed695',
        boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.35)',
        width: '100%',
        maxWidth: '920px',
        minHeight: '540px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Close Modal Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            color: '#c59b27',
            cursor: 'pointer',
            zIndex: 20,
            padding: '4px'
          }}
          title="Close"
        >
          <X size={22} />
        </button>

        {/* LEFT PANEL: Rich Gold with Touch of Black */}
        <div style={{
          flex: '0 0 44%',
          position: 'relative',
          background: 'linear-gradient(160deg, #a47814 0%, #c59b27 35%, #d8ac32 65%, #0a0e17 100%)',
          color: '#ffffff',
          padding: '44px 38px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          zIndex: 2
        }}>
          <img
            src={swissmaxLogo}
            alt="SwissMax Beauty Logo"
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'cover',
              borderRadius: '50%',
              margin: '0 auto 16px auto',
              display: 'block',
              border: '3.5px solid #ffffff',
              boxShadow: '0 10px 24px rgba(0, 0, 0, 0.3)',
              backgroundColor: '#090d16'
            }}
          />
          <h2 style={{
            fontSize: '1.65rem',
            fontWeight: '800',
            letterSpacing: '0.08em',
            margin: '0 0 4px 0',
            textTransform: 'uppercase',
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.25)'
          }}>
            SWISSMAX
          </h2>
          <p style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#ffffff',
            margin: '0 0 18px 0',
            opacity: 0.95
          }}>
            BEAUTY GRP LIMITED
          </p>
          <p style={{
            fontSize: '0.9rem',
            lineHeight: '1.6',
            color: '#ffffff',
            margin: '0 auto 24px auto',
            maxWidth: '280px'
          }}>
            Artisanal Swiss cosmetic formulations, botanical skincare & haute parfumerie.
          </p>
          <p style={{
            fontSize: '0.74rem',
            color: '#ffffff',
            margin: 0,
            letterSpacing: '0.02em',
            opacity: 0.85
          }}>
            ✦ Developed for SwissMax Beauty GRP Limited
          </p>

          {/* Scalloped Cloud Divider SVG */}
          <div style={{
            position: 'absolute',
            right: '-36px',
            top: 0,
            bottom: 0,
            width: '36px',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10
          }}>
            <svg viewBox="0 0 36 600" preserveAspectRatio="none" style={{ height: '100%', width: '36px', display: 'block' }}>
              <path d="M 0,0 C 24,35 24,65 0,100 C 26,135 26,165 0,200 C 28,235 28,265 0,300 C 26,335 26,365 0,400 C 28,435 28,465 0,500 C 24,535 24,565 0,600 L 0,600 L 0,0 Z" fill="rgba(212, 175, 55, 0.2)" transform="translate(6, 0)" />
              <path d="M 0,0 C 20,35 20,65 0,100 C 22,135 22,165 0,200 C 24,235 24,265 0,300 C 22,335 22,365 0,400 C 24,435 24,465 0,500 C 20,535 20,565 0,600 L 0,600 L 0,0 Z" fill="rgba(242, 222, 160, 0.45)" transform="translate(3, 0)" />
              <path d="M 0,0 C 16,35 16,65 0,100 C 18,135 18,165 0,200 C 20,235 20,265 0,300 C 18,335 18,365 0,400 C 20,435 20,465 0,500 C 16,535 16,565 0,600 L 0,600 L 0,0 Z" fill="url(#panel-modal-gold-gradient)" />
              <defs>
                <linearGradient id="panel-modal-gold-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a47814" />
                  <stop offset="35%" stopColor="#c59b27" />
                  <stop offset="65%" stopColor="#d8ac32" />
                  <stop offset="100%" stopColor="#0a0e17" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* RIGHT PANEL: Pure White & Gold Form */}
        <div style={{
          flex: 1,
          background: '#ffffff',
          padding: '50px 50px 40px 60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Decorative Watermark */}
          <svg
            viewBox="0 0 200 200"
            fill="none"
            style={{
              position: 'absolute',
              right: '-20px',
              bottom: '-20px',
              width: '220px',
              height: '220px',
              opacity: 0.12,
              pointerEvents: 'none',
              zIndex: 0
            }}
          >
            <circle cx="100" cy="100" r="80" stroke="#c59b27" strokeWidth="8" strokeDasharray="10 15" />
            <circle cx="100" cy="100" r="50" stroke="#c59b27" strokeWidth="4" />
            <path d="M 40,160 Q 100,60 160,160" stroke="#c59b27" strokeWidth="10" strokeLinecap="round" />
          </svg>

          <div style={{ marginBottom: '24px', position: 'relative', zIndex: 2 }}>
            <h1 style={{
              fontSize: '2.1rem',
              fontWeight: '800',
              color: '#c59b27',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em'
            }}>
              Log in
            </h1>
            <p style={{
              fontSize: '0.92rem',
              color: '#453412',
              margin: 0,
              fontWeight: '500'
            }}>
              Please fill in your admin credentials to login.
            </p>
          </div>

          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              color: '#991b1b',
              border: '1.5px solid #fecaca',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '0.86rem',
              marginBottom: '18px',
              fontWeight: '600',
              position: 'relative',
              zIndex: 2
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#000000',
                marginBottom: '6px'
              }}>
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter admin username"
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid #c59b27',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '0.98rem',
                  fontWeight: '600',
                  color: '#000000',
                  outline: 'none',
                  boxShadow: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px', position: 'relative' }}>
              <label style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#000000',
                marginBottom: '6px'
              }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter admin password"
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #c59b27',
                    borderRadius: '12px',
                    padding: '12px 46px 12px 16px',
                    fontSize: '0.98rem',
                    fontWeight: '600',
                    color: '#000000',
                    outline: 'none',
                    boxShadow: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    color: '#c59b27',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Toggle visibility"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <input
                type="checkbox"
                id="modal_remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '17px', height: '17px', accentColor: '#c59b27', cursor: 'pointer' }}
              />
              <label htmlFor="modal_remember" style={{ fontSize: '0.88rem', color: '#000000', fontWeight: '500', cursor: 'pointer' }}>
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '150px',
                background: 'linear-gradient(135deg, #c59b27 0%, #e0b84c 100%)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '1.02rem',
                padding: '12px 26px',
                border: 'none',
                borderRadius: '28px',
                cursor: loading ? 'wait' : 'pointer',
                boxShadow: '0 6px 18px rgba(197, 155, 39, 0.35)',
                transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Verifying...' : 'Log in'}
            </button>
          </form>

          <p style={{
            fontSize: '0.8rem',
            fontStyle: 'italic',
            color: '#854d0e',
            margin: '14px 0 0 0',
            position: 'relative',
            zIndex: 2
          }}>
            *Do not share your login credentials with anyone.
          </p>

          <div style={{ marginTop: '16px', position: 'relative', zIndex: 2 }}>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#c59b27',
                fontSize: '0.84rem',
                fontWeight: '700',
                cursor: 'pointer',
                padding: 0
              }}
            >
              ← Cancel and Return to Storefront
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
