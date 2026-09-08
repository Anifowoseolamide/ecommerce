import { INITIAL_BANNER, INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../data/initialData';

const STORAGE_KEYS = {
  BANNER: 'swissmax_banner_data',
  CATEGORIES: 'swissmax_categories_data',
  PRODUCTS: 'swissmax_products_data',
};

export async function fetchBannerData() {
  try {
    const res = await fetch('/api/banners/');
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
      return JSON.parse(local);
    } catch (e) {}
  }
  return INITIAL_BANNER;
}

export async function saveBannerData(updatedBanner, imageFiles = {}) {
  // Try backend first
  try {
    const formData = new FormData();
    Object.keys(updatedBanner).forEach(key => {
      formData.append(key, updatedBanner[key]);
    });
    if (imageFiles.left_image_file) {
      formData.append('left_image_file', imageFiles.left_image_file);
    }
    if (imageFiles.right_image_file) {
      formData.append('right_image_file', imageFiles.right_image_file);
    }

    const res = await fetch('/api/banners/update/', {
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
    const res = await fetch('/api/categories/');
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
    try { return JSON.parse(local); } catch(e){}
  }
  return INITIAL_CATEGORIES;
}

export async function saveCategoriesData(categoriesList) {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categoriesList));
  return categoriesList;
}

export async function fetchProductsData() {
  try {
    const res = await fetch('/api/products/');
    if (res.ok) {
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        const formatted = data.products.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          description: p.description,
          category_slug: p.category_slug,
          category_name: p.category_name,
          image: p.image || (INITIAL_PRODUCTS.find(ip => ip.name === p.name)?.image) || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
          tag: p.category_name
        }));
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(formatted));
        return formatted;
      }
    }
  } catch (e) {}

  const local = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (local) {
    try { return JSON.parse(local); } catch(e){}
  }
  return INITIAL_PRODUCTS;
}

export async function saveProductsData(productsList) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(productsList));
  return productsList;
}

export async function uploadMediaFile(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload/', {
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
