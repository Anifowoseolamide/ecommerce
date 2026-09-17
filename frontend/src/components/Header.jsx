import React, { useState } from 'react';
import { Search, ShoppingBag, User, Sliders, X, Menu, ChevronRight } from 'lucide-react';
import swissmaxLogo from '../assets/swissmax-logo.jpg';

export default function Header({
  cartCount,
  onOpenCart,
  selectedCurrency,
  onChangeCurrency,
  activeCategory,
  onSelectCategory,
  currentView,
  onToggleView,
  searchQuery,
  onSearchChange,
}) {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navCategories = [
    { label: 'ALL PRODUCTS', slug: 'all' },
    { label: 'SKINCARE', slug: 'skincare' },
    { label: 'COSMETICS', slug: 'cosmetics' },
    { label: 'PERFUME', slug: 'perfume' },
  ];

  const handleMobileNavClick = (slug) => {
    if (currentView !== 'store') onToggleView('store');
    onSelectCategory(slug);
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById('catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      <header className="site-header">
        <div className="container">
          <div className="header-inner">
            {/* Mobile Menu Hamburger (Visible on Mobile/Tablet) */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              title="Open Navigation Menu"
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>

            {/* SwissMax Brand Crest Logo */}
            <div 
              className="brand-wrapper" 
              onClick={() => {
                if (currentView !== 'store') onToggleView('store');
                onSelectCategory('all');
              }}
              title="SwissMax Beauty Home"
            >
              <img 
                src={swissmaxLogo} 
                alt="SwissMax Beauty Logo" 
                className="brand-logo-img" 
              />
              <div className="brand-title-group">
                <span className="brand-title-name">SwissMax</span>
                <span className="brand-title-sub">BEAUTY GRP LIMITED</span>
              </div>
            </div>

            {/* Action Controls: Currency, Search, Profile, Cart, Dashboard */}
            <div className="header-actions">
              {/* Currency Switcher (Hidden on narrow mobile, available in mobile drawer) */}
              <select 
                className="currency-select desktop-currency"
                value={selectedCurrency}
                onChange={(e) => onChangeCurrency(e.target.value)}
                title="Select Currency"
              >
                <option value="USD">USD $</option>
                <option value="EUR">EUR €</option>
                <option value="GBP">GBP £</option>
                <option value="CHF">CHF Fr</option>
                <option value="GHS">GHS ₵</option>
              </select>

              {/* Quick Search Toggle */}
              <div style={{ position: 'relative' }}>
                {showSearchInput ? (
                  <div className="header-search-bar">
                    <input
                      type="text"
                      placeholder="Search SwissMax..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange(e.target.value)}
                      autoFocus
                    />
                    <button onClick={() => setShowSearchInput(false)} style={{ color: '#888', display: 'flex' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button 
                    className="icon-btn" 
                    onClick={() => setShowSearchInput(true)} 
                    title="Search catalog"
                  >
                    <Search size={19} />
                  </button>
                )}
              </div>

              {/* User Profile */}
              <button 
                className="icon-btn desktop-user" 
                title="VIP Client Portal" 
                onClick={() => alert("SwissMax VIP Client Portal")}
              >
                <User size={19} />
              </button>

              {/* Shopping Bag with Live Badge */}
              <button className="icon-btn" onClick={onOpenCart} title="View Shopping Bag">
                <ShoppingBag size={19} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Sub-Navigation Bar: Categories */}
        {currentView === 'store' && (
          <nav className="sub-nav desktop-sub-nav">
            <div className="container">
              <ul className="nav-links-list">
                {navCategories.map((cat) => (
                  <li key={cat.slug}>
                    <button
                      className={`nav-item-link ${activeCategory === cat.slug ? 'active' : ''}`}
                      onClick={() => {
                        onSelectCategory(cat.slug);
                        const catSection = document.getElementById('catalog');
                        if (catSection) catSection.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {cat.label}
                    </button>
                  </li>
                ))}
                <li>
                  <button 
                    className="nav-item-link"
                    onClick={() => {
                      const el = document.getElementById('brand-story');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    OUR HERITAGE
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        )}
      </header>

      {/* Mobile Slide-out Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={swissmaxLogo} alt="Logo" style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid var(--color-gold)' }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', color: 'var(--color-gold)', fontSize: '15px', fontWeight: '700' }}>SwissMax</div>
                  <div style={{ fontSize: '8px', color: '#888', letterSpacing: '0.18em' }}>BEAUTY GRP LIMITED</div>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} style={{ color: '#FFF', padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            <div className="mobile-drawer-body">
              {/* Mobile Search Input */}
              <div style={{ padding: '14px 16px', background: '#16181E', borderBottom: '1px solid var(--border-dark)', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="Search SwissMax..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#FFF', fontSize: '13px', outline: 'none' }}
                />
              </div>

              {/* Navigation Items */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {navCategories.map((cat) => (
                  <button
                    key={cat.slug}
                    className={`mobile-drawer-link ${activeCategory === cat.slug ? 'active' : ''}`}
                    onClick={() => handleMobileNavClick(cat.slug)}
                  >
                    <span>{cat.label}</span>
                    <ChevronRight size={14} color="var(--color-gold)" />
                  </button>
                ))}

                <button
                  className="mobile-drawer-link"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    const el = document.getElementById('brand-story');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>OUR HERITAGE</span>
                  <ChevronRight size={14} color="var(--color-gold)" />
                </button>
              </div>

              {/* Mobile Currency & Admin Action */}
              <div style={{ borderTop: '1px solid var(--border-dark)', marginTop: '24px', paddingTop: '20px' }}>
                <div style={{ fontSize: '10px', color: 'var(--color-gold)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>
                  Select Currency:
                </div>
                <select
                  className="currency-select"
                  value={selectedCurrency}
                  onChange={(e) => onChangeCurrency(e.target.value)}
                  style={{ width: '100%', padding: '10px' }}
                >
                  <option value="USD">USD $ - US Dollar</option>
                  <option value="EUR">EUR € - Euro</option>
                  <option value="GBP">GBP £ - British Pound</option>
                  <option value="CHF">CHF Fr - Swiss Franc</option>
                  <option value="GHS">GHS ₵ - Ghanaian Cedi</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
