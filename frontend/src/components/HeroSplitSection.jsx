import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { INITIAL_SLIDES } from '../data/initialData';

export default function HeroSplitSection({ banner, onDiscoverClick }) {
  const slides = (banner.slides && banner.slides.length > 0) ? banner.slides : INITIAL_SLIDES;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto rotate slides every 4.5 seconds
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  const activeSlide = slides[currentIdx] || slides[0];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  };

  return (
    <section 
      className="hero-split-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="hero-split-grid position-relative">
        {/* Left Editorial Panel (Screenshot 1 Style) */}
        <div className="hero-panel left-panel">
          <img 
            key={`left-${activeSlide.id || currentIdx}`}
            src={activeSlide.left_banner_image} 
            alt={activeSlide.title || "SwissMax Beauty"} 
            className="hero-bg-img hero-img-fade" 
          />
          <div className="hero-overlay-tint" />
          
          <div className="hero-content">
            <span className="hero-subtext hero-text-fade" style={{ fontSize: '13px', display: 'block', marginBottom: '14px', opacity: 0.95 }}>
              {activeSlide.subtitle || banner.subtitle || "Welcome to SwissMax Beauty We curate iconic brands that deserve attention."}
            </span>
            <h1 className="hero-heading hero-text-fade">
              {activeSlide.title || banner.title || "ICONIC SWISS BEAUTY"}
            </h1>
            <button 
              className="btn-discover btn-discover-accent"
              onClick={onDiscoverClick}
            >
              <span>{activeSlide.button_text || banner.button_text || "DISCOVER"}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Right Editorial Showcase Panel */}
        <div className="hero-panel right-panel">
          <img 
            key={`right-${activeSlide.id || currentIdx}`}
            src={activeSlide.right_banner_image} 
            alt="SwissMax Luxury Showcase" 
            className="hero-bg-img hero-img-fade" 
          />
          <div className="hero-overlay-tint" />
          
          <div className="hero-content" style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <span className="hero-eyebrow hero-text-fade">
              {activeSlide.right_eyebrow || "Haute Parfumerie & Soins"}
            </span>
            <h2 className="hero-text-fade" style={{ fontFamily: 'var(--font-display)', fontSize: '26px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
              {activeSlide.right_title || "The Alpine Reserve"}
            </h2>
            <button 
              className="btn-discover"
              onClick={onDiscoverClick}
              style={{ marginLeft: 'auto' }}
            >
              <span>EXPLORE EDITIONS</span>
            </button>
          </div>
        </div>

        {/* Slide Carousel Controls & Indicators */}
        {slides.length > 1 && (
          <>
            {/* Left Chevron */}
            <button 
              className="hero-nav-arrow hero-nav-prev"
              onClick={handlePrev}
              title="Previous Slide"
              aria-label="Previous Slide"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Right Chevron */}
            <button 
              className="hero-nav-arrow hero-nav-next"
              onClick={handleNext}
              title="Next Slide"
              aria-label="Next Slide"
            >
              <ChevronRight size={20} />
            </button>

            {/* Pagination Indicators */}
            <div className="hero-carousel-pagination">
              {slides.map((s, idx) => (
                <button
                  key={s.id || idx}
                  className={`hero-dot-btn ${currentIdx === idx ? 'active' : ''}`}
                  onClick={() => setCurrentIdx(idx)}
                  title={`Go to Slide ${idx + 1}`}
                >
                  <span className="dot-label">0{idx + 1}</span>
                  <span className="dot-bar" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
