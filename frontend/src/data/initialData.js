// SwissMax Beauty - Initial Data Store

export const CURRENCY_RATES = {
  NGN: { symbol: '₦', rate: 1, label: 'NGN ₦' },
  USD: { symbol: '$', rate: 1 / 1550, label: 'USD $' },
  EUR: { symbol: '€', rate: 1 / 1680, label: 'EUR €' },
  GBP: { symbol: '£', rate: 1 / 1950, label: 'GBP £' },
  GHS: { symbol: 'GH₵ ', rate: 1 / 105, label: 'GHS ₵' },
  CHF: { symbol: 'CHF ', rate: 1 / 1750, label: 'CHF Fr' },
};

// Product badge options; must match PRODUCT_TAG_CHOICES in products/models.py
export const PRODUCT_TAGS = ['New', 'Limited Edition', 'Sale'];

// CSS modifier for a tag badge, e.g. 'Limited Edition' -> 'tag-limited-edition'
export const tagClassName = (tag) => `tag-${tag.toLowerCase().replace(/\s+/g, '-')}`;

export const formatCurrency = (amount, currency = 'NGN') => {
  const { symbol, rate } = CURRENCY_RATES[currency] || CURRENCY_RATES.NGN;
  const converted = amount * rate;
  if (currency === 'NGN') {
    return `${symbol}${Math.round(converted).toLocaleString('en-NG')}`;
  }
  return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const INITIAL_SLIDES = [
  {
    id: 'slide-1',
    left_banner_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85',
    right_banner_image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=85',
    title: 'Original Manufacturer Products',
    subtitle: 'Welcome to SwissMaxBeauty. We curate iconic brands',
    right_title: 'We Deliver Across West Africa',
    right_eyebrow: 'Regional Supply Chain',
    button_text: 'DISCOVER'
  },
  {
    id: 'slide-2',
    left_banner_image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=85',
    right_banner_image: 'https://images.unsplash.com/photo-1608248597359-009156477b79?auto=format&fit=crop&w=1200&q=85',
    title: 'CELLULAR GLACIER ESSENCE',
    subtitle: 'Infused with bio-active Swiss peptides and high-altitude edelweiss cells.',
    right_title: 'PURE BOTANICAL ELIXIRS',
    right_eyebrow: 'Restorative Care',
    button_text: 'EXPLORE SKINCARE'
  },
  {
    id: 'slide-3',
    left_banner_image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1200&q=85',
    right_banner_image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=85',
    title: 'VELVET COUTURE COMPLEXION',
    subtitle: 'Micro-milled silk pigments and 24K gold infusions for multidimensional radiance.',
    right_title: 'HAUTE COSMETICS PALETTE',
    right_eyebrow: 'Atelier Editions',
    button_text: 'SHOP COSMETICS'
  },
  {
    id: 'slide-4',
    left_banner_image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85',
    right_banner_image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85',
    title: 'HAUTE PARFUMERIE FLACONS',
    subtitle: 'Smoked cedar, rare amber oud, and distilled Swiss mountain pine resins.',
    right_title: 'THE PRIVATE ARCHIVE',
    right_eyebrow: 'Bespoke Parfums',
    button_text: 'DISCOVER PERFUME'
  },
  {
    id: 'slide-5',
    left_banner_image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85',
    right_banner_image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85',
    title: 'WHOLESALE & RESELLER NETWORK',
    subtitle: 'Direct original manufacturer supply at competitive prices for emerging businesses.',
    right_title: 'GET UP TO 10% OFF',
    right_eyebrow: 'Business Starters Privilege',
    button_text: 'JOIN RESELLER NETWORK'
  }
];

export const INITIAL_BANNER = {
  title: "Original Manufacturer Products",
  subtitle: "Welcome to SwissMaxBeauty. We curate iconic brands",
  button_text: "DISCOVER",
  left_banner_image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85",
  right_banner_image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=85",
  announcement_text: "We deliver across West Africa • Business Starters Privilege Up to 10% Off",
  announcement_link_text: "shop now",
  countdown_days: 22,
  countdown_hours: 9,
  countdown_minutes: 21,
  countdown_seconds: 37,
  slides: INITIAL_SLIDES,
};


export const INITIAL_CATEGORIES = [
  {
    id: "cat-1",
    name: "Skincare",
    slug: "skincare",
    description: "Original Manufacturer products you can trust.",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
    product_count: 4
  },
  {
    id: "cat-2",
    name: "Cosmetics",
    slug: "cosmetics",
    description: "Luminous silk foundations, velvet matte lip formulations, and 24K gold powders.",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
    product_count: 4
  },
  {
    id: "cat-3",
    name: "Perfume",
    slug: "perfume",
    description: "Sprays, Deodorants, Oil Parfums, and Unique collection.",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
    product_count: 4
  }
];

export const EDITORIAL_LOOKBOOK = [
  {
    id: "look-1",
    title: "The Alpine Glacial Sanctuary",
    subtitle: "Pristine Swiss Glacial Mineral Hydration",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "look-2",
    title: "Haute Parfumerie Flacons",
    subtitle: "Distilled Rare Alpine Woods & Resins",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "look-3",
    title: "Velvet Couture Complexion",
    subtitle: "Luminous Micro-Silk Infusions",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: "look-4",
    title: "Artisanal 24K Gold Elixirs",
    subtitle: "Crafted in Swiss Alpine Laboratories",
    image: "https://images.unsplash.com/photo-1512290900672-1f55a1d7f642?auto=format&fit=crop&w=900&q=85",
  }
];

export const HERITAGE_FEATURE = {
  title: "BEAUTY BRANDS YOU CAN TRUST AT THE BEST PRICE",
  subtitle: "ORIGINAL. AFFORDABLE. PRISTINE",
  badge_text: "SwissMax Beauty . Tradefair, Lagos",
  body: "Founded in 2022 in Lagos Nigeria, SwissMax Beauty Group LTD curates and imports exceptional, high-in-demand and effective Beauty products directly from original Manufacturers, making them available to our customers at highly competitive prices",
  image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85",
  stats: [
    { label: "Original Product Manufacturer", value: "100%" },
    { label: "Affordability Rating", value: "98.7%" },
    { label: "Global Supply to Resellers", value: "Bulk Orders" }
  ],
  pillars: [
    "Certified distributor of over 30 OPM",
    "Western Africa wide Delivery",
    "Thailand, Korea, USA Products."
  ]
};

