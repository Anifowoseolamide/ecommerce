import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Save, CheckCircle2, ArrowLeft, RefreshCw, Plus, Trash2, Edit2, Sparkles } from 'lucide-react';
import { uploadMediaFile } from '../services/api';
import { INITIAL_SLIDES } from '../data/initialData';

export default function Dashboard({
  banner,
  onUpdateBanner,
  categories,
  onUpdateCategory,
  products,
  onUpdateProduct,
  onAddProduct,
  onBackToStore
}) {
  const [activeTab, setActiveTab] = useState('hero'); // 'hero' | 'categories' | 'products'
  
  // Slides State (Rotating cosmetic & beauty banners)
  const [slides, setSlides] = useState(
    (banner.slides && banner.slides.length > 0) ? banner.slides : INITIAL_SLIDES
  );
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  // Top Announcement & Countdown Settings
  const [promoForm, setPromoForm] = useState({
    announcement_text: banner.announcement_text || 'Website Sale Up to 30% off + Free Shipping',
    announcement_link_text: banner.announcement_link_text || 'shop now',
    countdown_days: banner.countdown_days || 22,
    countdown_hours: banner.countdown_hours || 9,
    countdown_minutes: banner.countdown_minutes || 21,
    countdown_seconds: banner.countdown_seconds || 37,
  });

  const [savingNotice, setSavingNotice] = useState('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 120,
    category_slug: 'skincare',
    category_name: 'Skincare',
    description: '',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    tag: 'New'
  });

  const currentSlide = slides[activeSlideIdx] || slides[0];

  // Update field on the active slide
  const handleUpdateCurrentSlide = (field, value) => {
    const updated = slides.map((s, idx) => 
      idx === activeSlideIdx ? { ...s, [field]: value } : s
    );
    setSlides(updated);
  };

  // Upload Left Image for current slide
  const handleSlideLeftUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await uploadMediaFile(file);
      handleUpdateCurrentSlide('left_banner_image', url);
    }
  };

  // Upload Right Image for current slide
  const handleSlideRightUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await uploadMediaFile(file);
      handleUpdateCurrentSlide('right_banner_image', url);
    }
  };

  // Add new slide
  const handleAddSlide = () => {
    const newSlide = {
      id: `slide-${Date.now()}`,
      left_banner_image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=85',
      right_banner_image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85',
      title: 'EXCLUSIVE BEAUTY EDITION',
      subtitle: 'Artisanal Swiss cosmetic formulations crafted for profound radiance.',
      right_title: 'ATELIER RESERVES',
      right_eyebrow: 'Limited Release',
      button_text: 'DISCOVER'
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    setActiveSlideIdx(updated.length - 1);
  };

  // Delete slide
  const handleDeleteSlide = (idxToDelete) => {
    if (slides.length <= 1) {
      alert('You must keep at least 1 hero banner slide.');
      return;
    }
    const updated = slides.filter((_, idx) => idx !== idxToDelete);
    setSlides(updated);
    setActiveSlideIdx(Math.max(0, activeSlideIdx - 1));
  };

  // Save all Hero & Slides
  const handleSaveHeroAndSlides = async (e) => {
    e.preventDefault();
    setSavingNotice('Saving all rotating hero slides to live store...');
    const firstSlide = slides[0];
    const payload = {
      ...promoForm,
      title: firstSlide.title,
      subtitle: firstSlide.subtitle,
      button_text: firstSlide.button_text,
      left_banner_image: firstSlide.left_banner_image,
      right_banner_image: firstSlide.right_banner_image,
      slides: slides
    };
    await onUpdateBanner(payload, {});
    setSavingNotice(`✓ All ${slides.length} hero slides updated! Moving one after the other on live store.`);
    setTimeout(() => setSavingNotice(''), 4000);
  };

  // Handle Category Image change
  const handleCategoryImageUpload = async (catSlug, file) => {
    if (file) {
      const uploadedUrl = await uploadMediaFile(file);
      onUpdateCategory(catSlug, { image: uploadedUrl });
    }
  };

  // Handle Product Image change
  const handleProductImageUpload = async (prodId, file) => {
    if (file) {
      const uploadedUrl = await uploadMediaFile(file);
      onUpdateProduct(prodId, { image: uploadedUrl });
    }
  };

  // Handle Add Product Submit
  const handleCreateProductSubmit = (e) => {
    e.preventDefault();
    if (!newProduct.name) return;
    const cat = categories.find(c => c.slug === newProduct.category_slug) || categories[0];
    onAddProduct({
      ...newProduct,
      id: `prod-${Date.now()}`,
      category_name: cat.name,
      price: Number(newProduct.price)
    });
    setShowAddProductModal(false);
    setNewProduct({
      name: '',
      price: 120,
      category_slug: 'skincare',
      category_name: 'Skincare',
      description: '',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      tag: 'New'
    });
    alert('New SwissMax product added to catalog!');
  };

  return (
    <div className="dashboard-wrapper">
      <div className="container">
        {/* Dashboard Top Header */}
        <div className="dashboard-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: '700' }}>
                ADMIN STUDIO
              </span>
              <span style={{ fontSize: '11px', color: '#BBB' }}>• SwissMax Beauty Management</span>
            </div>
            <h1 className="dashboard-title">IMAGE & STOREFRONT DASHBOARD</h1>
            <p className="dashboard-subtitle">
              Manage the 5 rotating split hero banners, category images, live countdown timers, and product catalog.
            </p>
          </div>

          <button 
            className="btn-discover"
            onClick={onBackToStore}
            style={{ borderColor: '#0B0C0E', color: '#0B0C0E', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={14} />
            <span>VIEW LIVE STORE</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="dashboard-tabs">
          <button
            className={`dashboard-tab-btn ${activeTab === 'hero' ? 'active' : ''}`}
            onClick={() => setActiveTab('hero')}
          >
            <ImageIcon size={15} />
            <span>ROTATING HERO SLIDES ({slides.length} SLIDES)</span>
          </button>
          <button
            className={`dashboard-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <ImageIcon size={15} />
            <span>CATEGORIES (SKINCARE, COSMETICS, PERFUME)</span>
          </button>
          <button
            className={`dashboard-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <ImageIcon size={15} />
            <span>PRODUCTS & CATALOG IMAGES ({products.length})</span>
          </button>
        </div>

        {savingNotice && (
          <div style={{ background: '#FAF6EF', border: '1px solid var(--color-gold)', padding: '12px 18px', marginBottom: '20px', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '10px', color: '#333', fontSize: '12px', fontWeight: '600' }}>
            <CheckCircle2 size={16} color="var(--color-gold)" />
            <span>{savingNotice}</span>
          </div>
        )}

        {/* TAB 1: ROTATING SPLIT HERO BANNERS */}
        {activeTab === 'hero' && (
          <div className="dashboard-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', letterSpacing: '0.06em' }}>
                  ROTATING SPLIT HERO BANNERS (MOVING ONE AFTER THE OTHER)
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  The homepage smoothly cycles through these {slides.length} luxury cosmetic and skincare slides every 4.5 seconds.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddSlide}
                className="btn-discover"
                style={{ background: '#FAF6EF', color: '#111', borderColor: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} color="var(--color-gold)" />
                <span>ADD ANOTHER SLIDE</span>
              </button>
            </div>

            {/* Slide Selector Buttons */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-light)' }}>
              {slides.map((s, idx) => (
                <button
                  key={s.id || idx}
                  type="button"
                  onClick={() => setActiveSlideIdx(idx)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.08em',
                    borderRadius: '2px',
                    border: activeSlideIdx === idx ? '1.5px solid var(--color-gold)' : '1px solid var(--border-light)',
                    background: activeSlideIdx === idx ? '#0B0C0E' : '#FFFFFF',
                    color: activeSlideIdx === idx ? 'var(--color-gold)' : '#333',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>SLIDE 0{idx + 1}</span>
                  {activeSlideIdx === idx && <Sparkles size={11} color="var(--color-gold)" />}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveHeroAndSlides}>
              <div style={{ background: '#FBFBFB', border: '1px solid var(--border-light)', padding: '24px', borderRadius: '2px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: '#0B0C0E', color: 'var(--color-gold)', padding: '4px 10px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em' }}>
                      EDITING SLIDE 0{activeSlideIdx + 1} OF 0{slides.length}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{currentSlide.title}</span>
                  </div>

                  {slides.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(activeSlideIdx)}
                      style={{ color: '#D9534F', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                      <span>Remove This Slide</span>
                    </button>
                  )}
                </div>

                {/* Left & Right Images for this Slide */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                  {/* LEFT IMAGE */}
                  <div style={{ border: '1px solid var(--border-light)', padding: '16px', background: '#FFF', borderRadius: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Left Image (Editorial)</span>
                      <span style={{ fontSize: '10px', color: 'var(--color-gold)', fontWeight: '600' }}>PANEL 1</span>
                    </div>

                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label" style={{ fontSize: '10px' }}>Upload Image File:</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleSlideLeftUpload} 
                        className="form-input" 
                        style={{ padding: '6px', fontSize: '11px' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label" style={{ fontSize: '10px' }}>Or Paste Image URL:</label>
                      <input
                        type="text"
                        className="form-input"
                        value={currentSlide.left_banner_image}
                        onChange={(e) => handleUpdateCurrentSlide('left_banner_image', e.target.value)}
                        placeholder="https://..."
                        style={{ fontSize: '12px' }}
                      />
                    </div>

                    {/* Preview Box */}
                    <div className="banner-preview-box">
                      <img
                        src={currentSlide.left_banner_image}
                        alt="Left Preview"
                        className="banner-preview-img"
                        style={{ height: '180px' }}
                      />
                    </div>
                  </div>

                  {/* RIGHT IMAGE */}
                  <div style={{ border: '1px solid var(--border-light)', padding: '16px', background: '#FFF', borderRadius: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Right Image (Showcase)</span>
                      <span style={{ fontSize: '10px', color: 'var(--color-gold)', fontWeight: '600' }}>PANEL 2</span>
                    </div>

                    <div className="form-group" style={{ marginBottom: '10px' }}>
                      <label className="form-label" style={{ fontSize: '10px' }}>Upload Image File:</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleSlideRightUpload} 
                        className="form-input" 
                        style={{ padding: '6px', fontSize: '11px' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label className="form-label" style={{ fontSize: '10px' }}>Or Paste Image URL:</label>
                      <input
                        type="text"
                        className="form-input"
                        value={currentSlide.right_banner_image}
                        onChange={(e) => handleUpdateCurrentSlide('right_banner_image', e.target.value)}
                        placeholder="https://..."
                        style={{ fontSize: '12px' }}
                      />
                    </div>

                    {/* Preview Box */}
                    <div className="banner-preview-box">
                      <img
                        src={currentSlide.right_banner_image}
                        alt="Right Preview"
                        className="banner-preview-img"
                        style={{ height: '180px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Typography Settings for this Slide */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                  <div>
                    <div className="form-group">
                      <label className="form-label">Left Headline Title:</label>
                      <input
                        type="text"
                        className="form-input"
                        value={currentSlide.title}
                        onChange={(e) => handleUpdateCurrentSlide('title', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Left Editorial Subtitle:</label>
                      <input
                        type="text"
                        className="form-input"
                        value={currentSlide.subtitle}
                        onChange={(e) => handleUpdateCurrentSlide('subtitle', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">CTA Button Label:</label>
                      <input
                        type="text"
                        className="form-input"
                        value={currentSlide.button_text || 'DISCOVER'}
                        onChange={(e) => handleUpdateCurrentSlide('button_text', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="form-group">
                      <label className="form-label">Right Showcase Headline:</label>
                      <input
                        type="text"
                        className="form-input"
                        value={currentSlide.right_title || 'The Alpine Reserve'}
                        onChange={(e) => handleUpdateCurrentSlide('right_title', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Right Eyebrow Category:</label>
                      <input
                        type="text"
                        className="form-input"
                        value={currentSlide.right_eyebrow || 'Haute Parfumerie & Soins'}
                        onChange={(e) => handleUpdateCurrentSlide('right_eyebrow', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ANNOUNCEMENT BAR & COUNTDOWN SETTINGS */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '24px', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
                  Top Announcement Bar & Live Sale Countdown Timer
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Announcement Sale Notice:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={promoForm.announcement_text}
                      onChange={(e) => setPromoForm({ ...promoForm, announcement_text: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Action Link Label:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={promoForm.announcement_link_text}
                      onChange={(e) => setPromoForm({ ...promoForm, announcement_link_text: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ background: '#F8F9FA', padding: '16px', borderRadius: '2px', border: '1px solid var(--border-light)' }}>
                  <label className="form-label">Countdown Clock Values (DAYS : HRS : MIN : SEC):</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>DAYS</span>
                      <input
                        type="number"
                        className="form-input"
                        value={promoForm.countdown_days}
                        onChange={(e) => setPromoForm({ ...promoForm, countdown_days: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>HOURS</span>
                      <input
                        type="number"
                        className="form-input"
                        value={promoForm.countdown_hours}
                        onChange={(e) => setPromoForm({ ...promoForm, countdown_hours: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>MINUTES</span>
                      <input
                        type="number"
                        className="form-input"
                        value={promoForm.countdown_minutes}
                        onChange={(e) => setPromoForm({ ...promoForm, countdown_minutes: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SECONDS</span>
                      <input
                        type="number"
                        className="form-input"
                        value={promoForm.countdown_seconds}
                        onChange={(e) => setPromoForm({ ...promoForm, countdown_seconds: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-save">
                <Save size={15} />
                <span>SAVE & APPLY ALL {slides.length} ROTATING SLIDES</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: CATEGORY IMAGES (SKINCARE, COSMETICS, PERFUME) */}
        {activeTab === 'categories' && (
          <div className="dashboard-panel">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '8px', letterSpacing: '0.06em' }}>
              MAIN PRODUCT CATEGORIES (SKINCARE, COSMETICS, PERFUME)
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Change the cover imagery and descriptive taglines for the three flagship disciplines.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {categories.map((cat) => (
                <div key={cat.slug} style={{ border: '1px solid var(--border-light)', padding: '18px', borderRadius: '2px', background: '#FAFAFA' }}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '2px', marginBottom: '14px' }}
                  />

                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    {cat.name}
                  </h3>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontSize: '10px' }}>Upload Image:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCategoryImageUpload(cat.slug, e.target.files[0])}
                      className="form-input"
                      style={{ padding: '6px', fontSize: '11px' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ fontSize: '10px' }}>Or Image URL:</label>
                    <input
                      type="text"
                      className="form-input"
                      value={cat.image}
                      onChange={(e) => onUpdateCategory(cat.slug, { image: e.target.value })}
                      style={{ fontSize: '11px' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label className="form-label" style={{ fontSize: '10px' }}>Tagline Description:</label>
                    <textarea
                      rows={2}
                      className="form-textarea"
                      value={cat.description}
                      onChange={(e) => onUpdateCategory(cat.slug, { description: e.target.value })}
                      style={{ fontSize: '11px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS & CATALOG IMAGES */}
        {activeTab === 'products' && (
          <div className="dashboard-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', letterSpacing: '0.06em' }}>
                  PRODUCT CATALOG IMAGERY & DETAILS
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Change product photography, prices, formulations, or add new luxury editions.
                </p>
              </div>

              <button
                className="btn-discover"
                onClick={() => setShowAddProductModal(true)}
                style={{ background: '#0B0C0E', color: 'var(--color-gold)', borderColor: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                <span>ADD NEW PRODUCT</span>
              </button>
            </div>

            {/* Product Items Table / Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {products.map((prod) => (
                <div
                  key={prod.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '16px',
                    border: '1px solid var(--border-light)',
                    background: '#FAFAFA',
                    borderRadius: '2px',
                    flexWrap: 'wrap'
                  }}
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '2px', background: '#EEE' }}
                  />

                  <div style={{ flexGrow: 1, minWidth: '220px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--color-gold)', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {prod.category_name}
                    </span>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: '600' }}>
                      {prod.name}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '480px', marginTop: '2px' }}>
                      {prod.description}
                    </p>
                  </div>

                  <div style={{ minWidth: '100px', fontSize: '15px', fontWeight: '700' }}>
                    ${prod.price}.00
                  </div>

                  {/* Change Image Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: '#FFF',
                        border: '1px solid var(--border-light)',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        borderRadius: '2px'
                      }}
                    >
                      <Upload size={13} color="var(--color-gold)" />
                      <span>Change Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleProductImageUpload(prod.id, e.target.files[0])}
                      />
                    </label>

                    <button
                      onClick={() => {
                        const newPrice = prompt(`Enter new price for ${prod.name}:`, prod.price);
                        if (newPrice !== null && !isNaN(Number(newPrice))) {
                          onUpdateProduct(prod.id, { price: Number(newPrice) });
                        }
                      }}
                      style={{
                        padding: '8px 12px',
                        background: '#FFF',
                        border: '1px solid var(--border-light)',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        borderRadius: '2px'
                      }}
                    >
                      Edit Price
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: ADD NEW PRODUCT */}
        {showAddProductModal && (
          <div className="modal-backdrop" onClick={() => setShowAddProductModal(false)}>
            <div 
              style={{ background: '#FFF', maxWidth: '520px', width: '100%', padding: '32px', borderRadius: '2px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '18px', letterSpacing: '0.06em' }}>
                ADD LUXURY BEAUTY PRODUCT
              </h3>

              <form onSubmit={handleCreateProductSubmit}>
                <div className="form-group">
                  <label className="form-label">Product Name:</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. Swiss Alpine Radiance Elixir"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Category:</label>
                    <select
                      className="form-select"
                      value={newProduct.category_slug}
                      onChange={(e) => setNewProduct({ ...newProduct, category_slug: e.target.value })}
                    >
                      <option value="skincare">Skincare</option>
                      <option value="cosmetics">Cosmetics</option>
                      <option value="perfume">Perfume</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price (USD $):</label>
                    <input
                      type="number"
                      required
                      className="form-input"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Product Image (File or URL):</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files[0]) {
                        const url = await uploadMediaFile(e.target.files[0]);
                        setNewProduct({ ...newProduct, image: url });
                      }
                    }}
                    className="form-input"
                    style={{ padding: '6px', marginBottom: '8px' }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    placeholder="Or paste image URL"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description:</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Key benefits and botanical extracts..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    style={{ padding: '10px 18px', border: '1px solid var(--border-light)', fontSize: '11px', fontWeight: '600' }}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="btn-save"
                    style={{ padding: '10px 20px' }}
                  >
                    CREATE PRODUCT
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
