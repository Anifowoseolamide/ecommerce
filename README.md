<p align="center">
  <img src="public/static/images/swissmax-logo.jpg" alt="SwissMax Beauty Logo" width="160" style="border-radius: 50%; border: 2px solid #C5A059;" />
</p>

<h1 align="center">SwissMax Beauty</h1>
<p align="center">
  <strong>SWISSMAX BEAUTY GRP LIMITED</strong><br>
  <em>Haute Parfumerie, Clinical Cellular Skincare & Bespoke Cosmetics</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-black?style=flat-square&logo=react" alt="React Vite" />
  <img src="https://img.shields.io/badge/Backend-Django%205.2-0C4B33?style=flat-square&logo=django" alt="Django" />
  <img src="https://img.shields.io/badge/Palette-White%20%7C%20Gold%20%7C%20Black-C5A059?style=flat-square" alt="Luxury Palette" />
  <img src="https://img.shields.io/badge/Deployment-Netlify%20Ready-00C7B7?style=flat-square&logo=netlify" alt="Netlify" />
</p>

---

## ⚜️ About SwissMax Beauty

**SwissMax BEAUTY GRP LIMITED** is a luxury e-commerce platform crafted for high-end beauty, clinical cellular treatments, and artisanal parfumerie. 

Inspired by editorial haute-couture boutique layouts (such as 755.Boutique), the platform blends a clean, minimalist **White, Gold, and Black** design system with a lightweight, modern decoupled architecture. Every element is designed to feel refined, fast, and elegant without backshadow gradients or artificial artifacts.

---

## ✨ Flagship Disciplines

The catalog is centered around three primary categories:

1. **Skincare**: Clinical Swiss cellular elixirs, glacier mineral serums, and overnight edelweiss recovery treatments.
2. **Cosmetics**: Micro-milled luminous silk foundations, velvet matte royal lip formulations, and 24K gold illuminating compacts.
3. **Perfume**: Artisanal extraits and pure parfums distilled from rare smoked woods, Cambodian oud, bourbon vanilla, and Alpine botanicals.

---

## 🌟 Key Features

### 1. Moving Hero Carousel (5 Rotating Slides)
- **Dynamic Split-Hero Layout**: Left editorial panel with headline typography and discovery CTA; Right panel with luxury lifestyle and fragrance showcase.
- **Continuous Slide Rotation**: Seamlessly transitions between 5 curated cosmetic and skincare slides every 4.5 seconds with silky smooth cross-fade animations.
- **Interactive Controls**: Numerical slide indicators (`01` through `05`), previous/next chevron arrows, and automatic pause on hover.

### 2. Live Top Announcement Bar
- Promotional sales strip with an active, real-time ticking countdown clock (`DAYS : HRS : MIN : SEC`).

### 3. Interactive Image Changing Dashboard
- Accessible via the **Dashboard** button in the header.
- **Hero Carousel Manager**: Change left and right images (via file upload or URL), edit headlines, adjust countdown clocks, and add or remove slides.
- **Category Manager**: Swap images and taglines for Skincare, Cosmetics, and Perfume.
- **Product Catalog Studio**: Upload photos, edit prices, descriptions, and add new luxury editions.
- **Immediate Persistence**: Changes take effect immediately on the live storefront and persist across refreshes via local storage and API synchronization.

### 4. Mobile-First Responsiveness
- **Slide-Out Navigation Drawer**: Smooth mobile menu with search, category links, currency selector, and dashboard toggle.
- **2-Column Product Grid**: Clean, high-density browsing standard on mobile devices.
- **Touch-Friendly Modals & Drawer**: Full-width shopping bag drawer (`100vw`) and mobile product detail sheets.

### 5. Luxury Shopping Experience
- **Multi-Currency Support**: Switch seamlessly between `USD ($)`, `EUR (€)`, `GBP (£)`, `CHF (Fr)`, and `GHS (₵)`.
- **Slide-Over Cart Bag**: Quantity controls, promo voucher support (e.g. `SWISS30` for 30% off, `GOLD10` for 10% off), and checkout simulation.
- **Swiss Alpine Heritage & Lookbook**: Rich photographic sections highlighting Zurich laboratory heritage and editorial campaign galleries.

---

## 🏛️ Project Architecture

```
Ecommerce/
├── frontend/                          # Separate Lightweight React + Vite App
│   ├── src/
│   │   ├── assets/                    # SwissMax crest logo & icons
│   │   ├── components/
│   │   │   ├── TopAnnouncementBar.jsx # Ticking countdown & promo bar
│   │   │   ├── Header.jsx             # Logo, currency, search, mobile drawer
│   │   │   ├── HeroSplitSection.jsx   # 5-slide rotating hero carousel
│   │   │   ├── CategorySection.jsx    # Skincare, Cosmetics, Perfume cards
│   │   │   ├── ProductGrid.jsx        # Catalog grid with filtering & sorting
│   │   │   ├── ProductCard.jsx        # Luxury card with quick-add
│   │   │   ├── ProductModal.jsx       # Specification picker & details
│   │   │   ├── CartDrawer.jsx         # Slide-over cart & voucher engine
│   │   │   ├── Dashboard.jsx          # Live image-changing studio
│   │   │   ├── HeritageSection.jsx    # Swiss cellular science story
│   │   │   ├── LookbookSection.jsx    # Editorial campaign gallery
│   │   │   └── Footer.jsx             # Luxury footer & VIP newsletter
│   │   ├── data/initialData.js        # Default SwissMax catalog & slides
│   │   ├── services/api.js            # API layer with localStorage fallback
│   │   ├── index.css                  # White/Gold/Black design system
│   │   └── App.jsx                    # Root application state
│   ├── public/_redirects              # Netlify SPA redirect rule
│   └── vite.config.js                 # Proxy config for Django backend
│
├── Ecommerce/                         # Django Project Settings & APIs
│   ├── settings.py                    # CORS & media configuration
│   ├── urls.py                        # REST & static route mapping
│   └── api_views.py                   # REST endpoints (banners, products, uploads)
├── products/                          # Product & Category models
│   └── management/commands/
│       └── populate_swissmax.py       # Seeds SwissMax categories & items
├── home/                              # HeroBanner models & views
├── cart/                              # Cart & payment processing
├── accounts/                          # User accounts & VIP client profiles
├── templates/                         # Synchronized Django server-rendered views
└── public/static/                     # Static media & SwissMax brand crest
```

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js**: v18 or higher (v24 recommended)
- **Python**: v3.10 or higher

---

### 2. Running the React Frontend (Recommended)
The separate React frontend provides the complete modern client experience with the moving carousel and live dashboard.

```bash
cd frontend
npm install
npm run dev
```

Open **http://127.0.0.1:5173/** in your browser.

---

### 3. Running the Django Backend (Optional / Parallel)

```bash
# In the root project directory:
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py populate_swissmax
python manage.py runserver 127.0.0.1:8000
```

- Storefront API: `http://127.0.0.1:8000/api/products/`
- Django Admin: `http://127.0.0.1:8000/admin/`

---

## 🌐 Deploying Frontend to Netlify

The frontend can be hosted directly on Netlify as a standalone web application.

### Option A: Drag & Drop (Instant)
1. Build the production assets:
   ```bash
   cd frontend
   npm run build
   ```
2. Navigate to **[Netlify Drop](https://app.netlify.com/drop)**.
3. Drag the `frontend/dist` folder directly onto the page.

### Option B: Continuous Deployment via GitHub
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`

*(The SPA redirect rule `_redirects` is already included to prevent 404s on page refresh.)*

---

## 📜 Brand Information

- **Company**: SwissMax BEAUTY GRP LIMITED
- **Ateliers**: Zurich • Geneva • London • Accra
- **Color Identity**: Pure White (`#FFFFFF`), Rich Gold (`#C5A059`), Deep Obsidian Black (`#0B0C0E`)
