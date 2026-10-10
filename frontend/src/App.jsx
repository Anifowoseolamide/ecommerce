import React, { useState, useEffect, useRef } from 'react';
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
  fetchStoreContact,
  saveBannerData,
  fetchCategoriesData,
  fetchProductsData,
  saveProductsData,
  createProductOnBackend,
  updateProductOnBackend,
  updateCategoryOnBackend,
  deleteProductOnBackend,
  getStoredAdminAuth,
  clearStoredAdminAuth,
  ADMIN_SESSION_EXPIRED_EVENT
} from './services/api';

import { INITIAL_BANNER, INITIAL_CATEGORIES } from './data/initialData';

const ADMIN_TABS = ['hero', 'categories', 'products', 'orders', 'payments'];

// /admin and /admin/<tab> are the dashboard; every other path is the storefront
function parsePath(pathname) {
  const match = pathname.replace(/\/+$/, '').match(/^\/admin(?:\/([a-z]+))?$/);
  if (!match) return { view: 'store', tab: 'hero' };
  return { view: 'dashboard', tab: ADMIN_TABS.includes(match[1]) ? match[1] : 'hero' };
}

export default function App() {
  // The address bar is the source of truth for which page is showing
  const [route, setRoute] = useState(() => parsePath(window.location.pathname));
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  // Only a stored backend token counts as logged in; the backend still verifies it on every save
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => Boolean(getStoredAdminAuth()));

  // The dashboard only renders for a logged-in admin; /admin while logged out shows the store plus the login
  const currentView = route.view === 'dashboard' && isAdminAuthenticated ? 'dashboard' : 'store';

  const navigate = (path, { replace = false } = {}) => {
    if (window.location.pathname !== path) {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
    }
    setRoute(parsePath(path));
  };

  // Back/Forward buttons
  useEffect(() => {
    const onPopState = () => setRoute(parsePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Visiting /admin while logged out opens the login
  useEffect(() => {
    if (route.view === 'dashboard' && !isAdminAuthenticated) setIsAdminModalOpen(true);
  }, [route.view, isAdminAuthenticated]);

  const [banner, setBanner] = useState(INITIAL_BANNER);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [products, setProducts] = useState([]);
  
  const [currency, setCurrency] = useState('NGN');
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
  const [storeWhatsApp, setStoreWhatsApp] = useState('');

  // Load backend/persisted data on startup
  useEffect(() => {
    // Independent of the catalog load so the chat button isn't held up by it
    fetchStoreContact().then((contact) => setStoreWhatsApp(contact.whatsapp_number));

    async function loadData() {
      const bannerData = await fetchBannerData();
      if (bannerData) setBanner(bannerData);

      const catData = await fetchCategoriesData();
      if (catData && catData.length > 0) setCategories(catData);

      const prodData = await fetchProductsData();
      if (Array.isArray(prodData)) setProducts(prodData);
    }
    loadData();
  }, []);

  // Switching between store and dashboard (e.g. the footer Staff link) starts at the top of the page.
  // Skips the first render so a refresh keeps the browser's restored scroll position.
  const isFirstViewRender = useRef(true);
  useEffect(() => {
    if (isFirstViewRender.current) {
      isFirstViewRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentView]);

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

  // Old shortcut: /?admin=true now redirects to /admin
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('admin') === 'true') {
      navigate('/admin', { replace: true });
    }
  }, []);

  const handleOpenAdminStudio = () => {
    if (isAdminAuthenticated) {
      navigate('/admin');
    } else {
      setIsAdminModalOpen(true);
    }
  };

  const handleLogoutAdmin = () => {
    clearStoredAdminAuth();
    setIsAdminAuthenticated(false);
    navigate('/');
  };

  // Backend rejected the admin token (expired/invalid): log out and ask for a fresh login
  useEffect(() => {
    const onSessionExpired = () => {
      // Stay on the admin address so logging back in returns to the same page
      setIsAdminAuthenticated(false);
      setIsAdminModalOpen(true);
    };
    window.addEventListener(ADMIN_SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(ADMIN_SESSION_EXPIRED_EVENT, onSessionExpired);
  }, []);

  // Dashboard Update Handlers connected to Backend
  const handleUpdateBanner = async (updatedBanner, imageFiles) => {
    const saved = await saveBannerData(updatedBanner, imageFiles);
    setBanner(saved);
  };

  // Saves to the backend first and throws on failure, so the dashboard never shows an edit that wasn't stored
  const handleUpdateCategory = async (catSlug, { description, image, imageFile }) => {
    const cat = categories.find(c => c.slug === catSlug);
    // Built-in fallback categories have ids like 'cat-1'; real ones are UUIDs
    if (!cat || !/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(String(cat.id))) {
      throw new Error('This category is not on the server yet. Reload the page and try again.');
    }

    await updateCategoryOnBackend(
      cat.id,
      { description, image: image !== cat.image ? image : undefined },
      imageFile || null
    );

    // Re-read from the server so what's shown is what was stored
    const fresh = await fetchCategoriesData();
    setCategories(fresh);
  };

  const handleUpdateProduct = async (productId, updates) => {
    // Sync with backend API and use the returned product data if available
    const backendProduct = await updateProductOnBackend(productId, updates);
    const mergedUpdates = backendProduct
      ? {
          name: backendProduct.name,
          price: backendProduct.price,
          description: backendProduct.description,
          category_name: backendProduct.category_name,
          category_slug: backendProduct.category_slug,
          tag: backendProduct.tag || '',
          image: backendProduct.image || updates.image,
        }
      : updates;

    const updated = products.map(p => p.id === productId ? { ...p, ...mergedUpdates } : p);
    setProducts(updated);
    await saveProductsData(updated);
  };

  const handleAddProduct = async (newProd) => {
    // Create directly on backend Supabase PostgreSQL database.
    // Throws if the save fails — no local-only fallback, since that copy vanishes on refresh.
    const savedProd = await createProductOnBackend(newProd);
    const productToAdd = {
      id: savedProd.id,
      name: savedProd.name,
      slug: savedProd.slug,
      price: savedProd.price,
      description: savedProd.description,
      category_name: savedProd.category_name,
      category_slug: savedProd.category_slug,
      image: savedProd.image || newProd.image,
      tag: savedProd.tag || ''
    };

    const updated = [productToAdd, ...products];
    setProducts(updated);
    await saveProductsData(updated);
  };

  const handleDeleteProduct = async (productId) => {
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    await deleteProductOnBackend(productId);
    await saveProductsData(updated);
  };

  const totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);


  return (
    <div className="swissmax-app">
      {/* The admin dashboard has its own sidebar layout, so store chrome only shows on the storefront */}
      {currentView !== 'dashboard' && (
        <>
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
            onToggleView={(view) => navigate(view === 'dashboard' ? '/admin' : '/')}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            whatsappNumber={storeWhatsApp}
          />
        </>
      )}

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
          onDeleteProduct={handleDeleteProduct}
          onBackToStore={() => navigate('/')}
          activeTab={route.tab}
          onTabChange={(tab) => navigate(`/admin/${tab}`)}
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
      {currentView !== 'dashboard' && (
        <Footer
          onSelectCategory={setActiveCategory}
          onOpenAdminLogin={handleOpenAdminStudio}
        />
      )}

      {/* Product Quick View Modal */}
      <ProductModal
        key={selectedProduct?.id}
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
        onClose={() => {
          setIsAdminModalOpen(false);
          // Closing the login without signing in leaves the admin address
          if (!getStoredAdminAuth() && route.view === 'dashboard') navigate('/', { replace: true });
        }}
        onLoginSuccess={() => {
          setIsAdminAuthenticated(true);
          if (route.view !== 'dashboard') navigate('/admin');
        }}
      />
    </div>
  );
}

