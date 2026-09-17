import React, { useState, useEffect } from 'react';
import TopAnnouncementBar from './components/TopAnnouncementBar';
import Header from './components/Header';
import HeroSplitSection from './components/HeroSplitSection';
import CategorySection from './components/CategorySection';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import Dashboard from './components/Dashboard';
import HeritageSection from './components/HeritageSection';
import LookbookSection from './components/LookbookSection';
import Footer from './components/Footer';
import AdminLoginModal from './components/AdminLoginModal';


import {
  fetchBannerData,
  saveBannerData,
  fetchCategoriesData,
  saveCategoriesData,
  fetchProductsData,
  saveProductsData,
  createProductOnBackend,
  updateProductOnBackend
} from './services/api';

import { INITIAL_BANNER, INITIAL_CATEGORIES, INITIAL_PRODUCTS } from './data/initialData';

export default function App() {
  const [currentView, setCurrentView] = useState('store'); // 'store' | 'dashboard'
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      const auth = localStorage.getItem('swissmax_admin_auth') || sessionStorage.getItem('swissmax_admin_auth');
      return Boolean(auth);
    } catch (e) {
      return false;
    }
  });

  const [banner, setBanner] = useState(INITIAL_BANNER);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  
  const [currency, setCurrency] = useState('USD');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('swissmax_cart');
    if (saved) {
      try { return JSON.parse(saved); } catch(e){}
    }
    return [];
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load backend/persisted data on startup
  useEffect(() => {
    async function loadData() {
      const bannerData = await fetchBannerData();
      if (bannerData) setBanner(bannerData);

      const catData = await fetchCategoriesData();
      if (catData && catData.length > 0) setCategories(catData);

      const prodData = await fetchProductsData();
      if (prodData && prodData.length > 0) setProducts(prodData);
    }
    loadData();
  }, []);

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem('swissmax_cart', JSON.stringify(cart));
  }, [cart]);

  // Cart operations
  const handleAddToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item => item.id === productId ? { ...item, quantity: newQty } : item)
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Check for ?admin=true query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      if (isAdminAuthenticated) {
        setCurrentView('dashboard');
      } else {
        setIsAdminModalOpen(true);
      }
    }
  }, [isAdminAuthenticated]);

  const handleOpenAdminStudio = () => {
    if (isAdminAuthenticated) {
      setCurrentView('dashboard');
    } else {
      setIsAdminModalOpen(true);
    }
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem('swissmax_admin_auth');
    sessionStorage.removeItem('swissmax_admin_auth');
    setIsAdminAuthenticated(false);
    setCurrentView('store');
  };

  // Dashboard Update Handlers connected to Backend
  const handleUpdateBanner = async (updatedBanner, imageFiles) => {
    const saved = await saveBannerData(updatedBanner, imageFiles);
    setBanner(saved);
  };

  const handleUpdateCategory = async (catSlug, updates) => {
    const updated = categories.map(c => c.slug === catSlug ? { ...c, ...updates } : c);
    setCategories(updated);
    await saveCategoriesData(updated);
  };

  const handleUpdateProduct = async (productId, updates) => {
    // Sync with backend API
    await updateProductOnBackend(productId, updates);
    const updated = products.map(p => p.id === productId ? { ...p, ...updates } : p);
    setProducts(updated);
    await saveProductsData(updated);
  };

  const handleAddProduct = async (newProd) => {
    // Create directly on backend Supabase PostgreSQL database
    const savedProd = await createProductOnBackend(newProd);
    const productToAdd = savedProd ? {
      id: savedProd.id,
      name: savedProd.name,
      slug: savedProd.slug,
      price: savedProd.price,
      description: savedProd.description,
      category_name: savedProd.category_name,
      category_slug: savedProd.category_slug,
      image: savedProd.image || newProd.image,
      tag: savedProd.category_name
    } : newProd;

    const updated = [productToAdd, ...products];
    setProducts(updated);
    await saveProductsData(updated);
  };

  const totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);


  return (
    <div className="swissmax-app">
      {/* 1. Top Announcement Bar with Live Countdown (Screenshot 1 Layout) */}
      <TopAnnouncementBar banner={banner} />

      {/* 2. Primary Luxury Header with SwissMax Logo & Controls */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        selectedCurrency={currency}
        onChangeCurrency={setCurrency}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        currentView={currentView}
        onToggleView={setCurrentView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main View Switcher: Storefront vs Dashboard */}
      {currentView === 'dashboard' ? (
        <Dashboard
          banner={banner}
          onUpdateBanner={handleUpdateBanner}
          categories={categories}
          onUpdateCategory={handleUpdateCategory}
          products={products}
          onUpdateProduct={handleUpdateProduct}
          onAddProduct={handleAddProduct}
          onBackToStore={() => setCurrentView('store')}
          onLogoutAdmin={handleLogoutAdmin}
        />
      ) : (
        <main>
          {/* 3. Editorial Split Hero Section (Screenshot 1 Layout) */}
          <HeroSplitSection
            banner={banner}
            onDiscoverClick={() => {
              const el = document.getElementById('catalog');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* 4. Flagship Categories (Skincare, Cosmetics, Perfume) */}
          <CategorySection
            categories={categories}
            onSelectCategory={setActiveCategory}
          />

          {/* 5. Luxury Product Catalog Grid */}
          <ProductGrid
            products={products}
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            currency={currency}
            onAddToCart={handleAddToCart}
            onQuickView={setSelectedProduct}
            searchQuery={searchQuery}
          />

          {/* 6. Swiss Alpine Cellular Heritage (Rich Visual Section) */}
          <HeritageSection
            onExploreClick={() => {
              const el = document.getElementById('catalog');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* 7. Editorial Lookbook Gallery (Images Across Disciplines) */}
          <LookbookSection
            onSelectCategory={setActiveCategory}
          />
        </main>

      )}

      {/* 6. Luxury Footer */}
      <Footer 
        onSelectCategory={(slug) => {
          if (currentView !== 'store') setCurrentView('store');
          setActiveCategory(slug);
        }} 
        onOpenAdminLogin={handleOpenAdminStudio}
      />

      {/* Product Quick View Modal */}
      <ProductModal
        product={selectedProduct}
        currency={currency}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Slide-over Luxury Cart Bag */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        currency={currency}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />

      {/* Luxury Split-Card Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={(user) => {
          setIsAdminAuthenticated(true);
          setCurrentView('dashboard');
        }}
      />
    </div>
  );
}

