import { INITIAL_BANNER, INITIAL_CATEGORIES } from '../data/initialData';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const STORAGE_KEYS = {
  BANNER: 'swissmax_banner_data',
  CATEGORIES: 'swissmax_categories_data',
  // v2: v1 caches contain the removed demo products and unsaved local-only products
  PRODUCTS: 'swissmax_products_data_v2',
  CONTACT: 'swissmax_store_contact',
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

    const res = await adminFetch(`${API_BASE}/api/banners/update/`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      if (data.banner) {
        localStorage.setItem(STORAGE_KEYS.BANNER, JSON.stringify(data.banner));
        return data.banner;
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
          description: INITIAL_CATEGORIES.find(ic => ic.slug === c.slug)?.description || '',
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

export async function fetchProductsData() {
  try {
    const res = await fetch(`${API_BASE}/api/products/`);
    if (res.ok) {
      const data = await res.json();
      // The backend is the source of truth — an empty list means there are no products yet
      if (Array.isArray(data.products)) {
        const formatted = data.products.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          description: p.description,
          category_slug: p.category_slug,
          category_name: p.category_name,
          image: p.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
          tag: p.tag || ''
        }));
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(formatted));
        return formatted;
      }
    }
  } catch (e) {}

  // Backend unreachable: show the last list it returned
  const local = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (local) {
    try { return JSON.parse(local); } catch(e){}
  }
  return [];
}

export async function saveProductsData(productsList) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(productsList));
  return productsList;
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

export async function updateProductOnBackend(productId, updates, imageFile = null) {
  try {
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

    const res = await adminFetch(`${API_BASE}/api/products/update/${productId}/`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      return data.product;
    }
  } catch (e) {
    console.error('Failed to update product on backend:', e);
  }
  return null;
}

export async function updateCategoryOnBackend(categoryId, name, imageFile = null) {
  try {
    const formData = new FormData();
    if (name) formData.append('category_name', name);
    if (imageFile) formData.append('image', imageFile);

    const res = await adminFetch(`${API_BASE}/api/categories/update/${categoryId}/`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      return data.category;
    }
  } catch (e) {
    console.error('Failed to update category on backend:', e);
  }
  return null;
}

export async function deleteProductOnBackend(productId) {
  try {
    const res = await adminFetch(`${API_BASE}/api/products/delete/${productId}/`, {
      method: 'POST',
    });
    if (res.ok) {
      const data = await res.json();
      return data.status === 'success';
    }
  } catch (e) {
    console.error('Failed to delete product on backend:', e);
  }
  return false;
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

export async function fetchOrders() {
  const data = await adminJson(`${API_BASE}/api/orders/`);
  return data.orders;
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
