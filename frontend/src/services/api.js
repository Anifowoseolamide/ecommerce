import { INITIAL_BANNER, INITIAL_CATEGORIES, HERITAGE_FEATURE, EDITORIAL_LOOKBOOK } from '../data/initialData';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const STORAGE_KEYS = {
  BANNER: 'swissmax_banner_data',
  CATEGORIES: 'swissmax_categories_data',
  CONTACT: 'swissmax_store_contact',
  HERITAGE: 'swissmax_heritage_data',
  ARTICLES: 'swissmax_articles_data',
};

export const ADMIN_AUTH_KEY = 'swissmax_admin_auth';
// Fired when the backend rejects the admin token, so the app can log out and ask for a fresh login
export const ADMIN_SESSION_EXPIRED_EVENT = 'swissmax:admin-session-expired';

export function getStoredAdminAuth() {
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_KEY) || sessionStorage.getItem(ADMIN_AUTH_KEY);
    const auth = raw ? JSON.parse(raw) : null;
    // Entries saved before token auth existed can't make authorized requests
    return auth && auth.token ? auth : null;
  } catch (e) {
    return null;
  }
}

export function clearStoredAdminAuth() {
  localStorage.removeItem(ADMIN_AUTH_KEY);
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
}

// fetch() for admin-only endpoints: attaches the bearer token and handles a rejected token
async function adminFetch(url, options = {}) {
  const token = getStoredAdminAuth()?.token || '';
  const res = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    clearStoredAdminAuth();
    window.dispatchEvent(new Event(ADMIN_SESSION_EXPIRED_EVENT));
  }
  return res;
}

export async function fetchBannerData() {
  try {
    const res = await fetch(`${API_BASE}/api/banners/`);

    if (res.ok) {
      const data = await res.json();
      if (data.banner) {
        localStorage.setItem(STORAGE_KEYS.BANNER, JSON.stringify(data.banner));
        return data.banner;
      }
    }
  } catch (err) {
    console.warn('API fetch failed, reading from local storage:', err);
  }

  const local = localStorage.getItem(STORAGE_KEYS.BANNER);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed && parsed.title === 'ICONIC SWISS BEAUTY') {
        localStorage.setItem(STORAGE_KEYS.BANNER, JSON.stringify(INITIAL_BANNER));
        return INITIAL_BANNER;
      }
      return parsed;
    } catch (e) {}
  }
  return INITIAL_BANNER;
}

export async function saveBannerData(updatedBanner, imageFiles = {}) {
  // Try backend first
  try {
    const formData = new FormData();
    Object.keys(updatedBanner).forEach(key => {
      const val = updatedBanner[key];
      // FormData cannot serialize arrays or objects — stringify them
      if (val !== null && val !== undefined) {
        formData.append(key, typeof val === 'object' ? JSON.stringify(val) : val);
      }
    });
    if (imageFiles.left_image_file) {
      formData.append('left_image_file', imageFiles.left_image_file);
    }
    if (imageFiles.right_image_file) {
      formData.append('right_image_file', imageFiles.right_image_file);
    }

    if (updatedBanner.left_banner_image && !updatedBanner.left_banner_url) {
      formData.append('left_banner_url', updatedBanner.left_banner_image);
    }
    if (updatedBanner.right_banner_image && !updatedBanner.right_banner_url) {
      formData.append('right_banner_url', updatedBanner.right_banner_image);
    }

    const res = await adminFetch(`${API_BASE}/api/banners/update/`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      if (data.banner) {
        const mergedBanner = {
          ...data.banner,
          slides: (updatedBanner.slides && updatedBanner.slides.length > 0) ? updatedBanner.slides : (data.banner.slides || []),
        };
        localStorage.setItem(STORAGE_KEYS.BANNER, JSON.stringify(mergedBanner));
        return mergedBanner;
      }
    }
  } catch (err) {
    console.warn('API update failed, saving locally:', err);
  }

  // Fallback save to local storage
  localStorage.setItem(STORAGE_KEYS.BANNER, JSON.stringify(updatedBanner));
  return updatedBanner;
}

export async function fetchCategoriesData() {
  try {
    const res = await fetch(`${API_BASE}/api/categories/`);
    if (res.ok) {
      const data = await res.json();
      if (data.categories && data.categories.length > 0) {
        // filter or format
        const formatted = data.categories.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          image: c.image || (INITIAL_CATEGORIES.find(ic => ic.slug === c.slug)?.image),
          description: c.description || INITIAL_CATEGORIES.find(ic => ic.slug === c.slug)?.description || '',
          product_count: c.product_count || 0
        }));
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(formatted));
        return formatted;
      }
    }
  } catch (e) {}

  const local = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (local) {
    try { 
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.some(c => c.slug === 'skincare' && c.description.includes('Advanced Swiss botanical'))) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
        return INITIAL_CATEGORIES;
      }
      return parsed; 
    } catch(e){}
  }
  return INITIAL_CATEGORIES;
}

export async function saveCategoriesData(categoriesList) {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categoriesList));
  return categoriesList;
}

const PRODUCT_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80';

// One page of products. The server filters (category, q), sorts and paginates.
// Resolves to { items, pagination: { page, page_size, total, total_pages }, counts: { all, <category-slug>: n } }.
export async function fetchProductsPage({ page = 1, pageSize = 12, category = '', q = '', sort = 'featured' } = {}) {
  const params = new URLSearchParams({ page, page_size: pageSize, sort });
  if (category) params.set('category', category);
  if (q) params.set('q', q);

  let res;
  try {
    res = await fetch(`${API_BASE}/api/products/?${params}`);
  } catch (e) {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !Array.isArray(data.products) || !data.pagination) {
    throw new Error(data.error || `Server error (${res.status}). Please try again.`);
  }

  return {
    items: data.products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      description: p.description,
      category_slug: p.category_slug,
      category_name: p.category_name,
      image: p.image || PRODUCT_IMAGE_FALLBACK,
      tag: p.tag || ''
    })),
    pagination: data.pagination,
    counts: data.counts,
  };
}

export async function uploadMediaFile(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await adminFetch(`${API_BASE}/api/upload/`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      return data.url;
    }
  } catch (e) {
    console.warn('Backend file upload failed, using FileReader fallback:', e);
  }

  // Fallback: Read as base64 data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

export async function loginAdmin(username, password) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Admin login failed:', err);
    return { success: false, error: 'Unable to connect to backend authentication server.' };
  }
}

// Throws on failure so the caller never shows a product that wasn't actually saved
export async function createProductOnBackend(productData, imageFile = null) {
  const formData = new FormData();
  formData.append('name', productData.name);
  formData.append('price', productData.price);
  formData.append('description', productData.description || '');
  formData.append('category', productData.category_slug || '');
  formData.append('tag', productData.tag || '');
  if (imageFile) {
    formData.append('image', imageFile);
  } else if (productData.image) {
    formData.append('image_url', productData.image);
  }

  let res;
  try {
    res = await adminFetch(`${API_BASE}/api/products/create/`, {
      method: 'POST',
      body: formData,
    });
  } catch (e) {
    console.error('Failed to create product on backend:', e);
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.product) {
    console.error('Backend rejected product create:', res.status, data);
    throw new Error(data.error || `Server error (${res.status}). Please try again.`);
  }
  return data.product;
}

// Throws on failure so the dashboard never shows an edit that wasn't stored
export async function updateProductOnBackend(productId, updates, imageFile = null) {
  const formData = new FormData();
  if (updates.name) formData.append('name', updates.name);
  if (updates.price !== undefined && updates.price !== null) formData.append('price', updates.price);
  if (updates.description !== undefined) formData.append('description', updates.description);
  if (updates.category_slug) formData.append('category', updates.category_slug);
  if (updates.tag !== undefined) formData.append('tag', updates.tag);
  // Support image updates: either a File object or a URL string
  if (imageFile) {
    formData.append('image', imageFile);
  } else if (updates.image && typeof updates.image === 'string' && updates.image.startsWith('http')) {
    formData.append('image_url', updates.image);
  }

  let res;
  try {
    res = await adminFetch(`${API_BASE}/api/products/update/${productId}/`, {
      method: 'POST',
      body: formData,
    });
  } catch (e) {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.product) {
    throw new Error(data.error || `Server error (${res.status}). Please try again.`);
  }
  return data.product;
}

// Saves a category's tagline and image (a File to upload, or an http(s) link). Throws on failure.
export async function updateCategoryOnBackend(categoryId, { description, image } = {}, imageFile = null) {
  const formData = new FormData();
  if (description !== undefined) formData.append('description', description);
  if (imageFile) {
    formData.append('image', imageFile);
  } else if (image) {
    formData.append('image_url', image);
  }

  let res;
  try {
    res = await adminFetch(`${API_BASE}/api/categories/update/${categoryId}/`, {
      method: 'POST',
      body: formData,
    });
  } catch (e) {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.category) {
    throw new Error(data.error || `Server error (${res.status}). Please try again.`);
  }
  return data.category;
}

// Throws on failure so a product that is still in the catalog is never shown as deleted
export async function deleteProductOnBackend(productId) {
  let res;
  try {
    res = await adminFetch(`${API_BASE}/api/products/delete/${productId}/`, { method: 'POST' });
  } catch (e) {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.status !== 'success') {
    throw new Error(data.error || `Server error (${res.status}). Please try again.`);
  }
}

// Public: place an order. Throws with the server's message; err.unavailable lists product ids no longer for sale.
export async function placeOrder(customer, cartItems) {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/orders/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...customer,
        items: cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })),
      }),
    });
  } catch (e) {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.order) {
    const err = new Error(data.error || `Server error (${res.status}). Please try again.`);
    err.unavailable = data.unavailable || [];
    throw err;
  }
  return { order: data.order, payment: data.payment };
}

// Admin JSON request that throws with the server's message on failure
async function adminJson(url, options = {}) {
  let res;
  try {
    res = await adminFetch(url, options);
  } catch (e) {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Server error (${res.status}). Please try again.`);
  }
  return data;
}

// One page of orders (newest first). Resolves to { items, pagination, counts: { all, new, paid, delivered, cancelled } }.
export async function fetchOrdersPage({ page = 1, pageSize = 20, status = '' } = {}) {
  const params = new URLSearchParams({ page, page_size: pageSize });
  if (status) params.set('status', status);
  const data = await adminJson(`${API_BASE}/api/orders/?${params}`);
  return { items: data.orders, pagination: data.pagination, counts: data.counts };
}

export async function updateOrderStatus(orderId, status) {
  const data = await adminJson(`${API_BASE}/api/orders/${orderId}/status/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return data.order;
}

export async function fetchCheckoutSettings() {
  const data = await adminJson(`${API_BASE}/api/checkout-settings/`);
  return data.settings;
}

export async function saveCheckoutSettings(settings) {
  const data = await adminJson(`${API_BASE}/api/checkout-settings/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return data.settings;
}

// Public: the shop's WhatsApp number for the "Chat with us" buttons. Cached so it shows while the backend wakes up.
export async function fetchStoreContact() {
  try {
    const res = await fetch(`${API_BASE}/api/store-contact/`);
    if (res.ok) {
      const data = await res.json();
      const contact = { whatsapp_number: data.whatsapp_number || '' };
      localStorage.setItem(STORAGE_KEYS.CONTACT, JSON.stringify(contact));
      return contact;
    }
  } catch (e) {}

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTACT)) || { whatsapp_number: '' };
  } catch (e) {
    return { whatsapp_number: '' };
  }
}

export async function fetchHeritageData() {
  try {
    const res = await fetch(`${API_BASE}/api/heritage/`);
    if (res.ok) {
      const data = await res.json();
      if (data.heritage) {
        localStorage.setItem(STORAGE_KEYS.HERITAGE, JSON.stringify(data.heritage));
        return data.heritage;
      }
    }
  } catch (err) {
    console.warn('API heritage fetch failed, reading from local storage:', err);
  }

  const local = localStorage.getItem(STORAGE_KEYS.HERITAGE);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (parsed && parsed.title) return parsed;
    } catch (e) {}
  }
  return HERITAGE_FEATURE;
}

export async function saveHeritageData(updatedHeritage, imageFile = null) {
  try {
    const formData = new FormData();
    Object.keys(updatedHeritage).forEach((key) => {
      const val = updatedHeritage[key];
      if (val !== null && val !== undefined) {
        formData.append(key, typeof val === 'object' ? JSON.stringify(val) : val);
      }
    });

    if (imageFile) {
      formData.append('image_file', imageFile);
    }
    if (updatedHeritage.image) {
      formData.append('image_url', updatedHeritage.image);
    }

    const res = await adminFetch(`${API_BASE}/api/heritage/update/`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.heritage) {
        localStorage.setItem(STORAGE_KEYS.HERITAGE, JSON.stringify(data.heritage));
        return data.heritage;
      }
    }
  } catch (err) {
    console.warn('API heritage update failed, saving locally:', err);
  }

  localStorage.setItem(STORAGE_KEYS.HERITAGE, JSON.stringify(updatedHeritage));
  return updatedHeritage;
}

// ---- Articles (the cards in the storefront's "Articles" section) ----

// Throws on failure; used by the admin editor so a failed load is never mistaken for "no articles"
export async function fetchArticlesOrThrow() {
  let res;
  try {
    res = await fetch(`${API_BASE}/api/articles/`);
  } catch (e) {
    throw new Error('Could not reach the server. Check your connection and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !Array.isArray(data.articles)) {
    throw new Error(data.error || `Server error (${res.status}). Please try again.`);
  }
  return data.articles;
}

// What the browser last received, so the section can render immediately; defaults before the first visit
export function getCachedArticles() {
  try {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLES));
    if (cached && Array.isArray(cached.articles)) return cached.articles;
  } catch (e) {}
  return EDITORIAL_LOOKBOOK;
}

// Storefront: latest articles from the server, falling back to the cached copy if it's unreachable
export async function fetchArticles() {
  try {
    const articles = await fetchArticlesOrThrow();
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify({ articles }));
    return articles;
  } catch (e) {
    return getCachedArticles();
  }
}

function articleFormData({ title, subtitle, image }, imageFile) {
  const formData = new FormData();
  if (title !== undefined) formData.append('title', title);
  if (subtitle !== undefined) formData.append('subtitle', subtitle);
  if (imageFile) {
    formData.append('image', imageFile);
  } else if (image) {
    formData.append('image_url', image);
  }
  return formData;
}

export async function createArticle(fields, imageFile = null) {
  const data = await adminJson(`${API_BASE}/api/articles/create/`, { method: 'POST', body: articleFormData(fields, imageFile) });
  return data.article;
}

export async function updateArticle(articleId, fields, imageFile = null) {
  const data = await adminJson(`${API_BASE}/api/articles/update/${articleId}/`, { method: 'POST', body: articleFormData(fields, imageFile) });
  return data.article;
}

export async function deleteArticle(articleId) {
  await adminJson(`${API_BASE}/api/articles/delete/${articleId}/`, { method: 'POST' });
}
