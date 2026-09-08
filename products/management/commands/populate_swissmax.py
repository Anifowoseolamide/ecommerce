from django.core.management.base import BaseCommand
from products.models import Category, Product, ProductImage, ColorVariant, SizeVariant
from home.models import HeroBanner


class Command(BaseCommand):
    help = 'Populates the database with SwissMax Beauty categories, products, and hero banner settings'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE("Initializing SwissMax Beauty data..."))

        # 1. Main Categories: Skincare, Cosmetics, Perfume
        categories_data = [
            {
                'name': 'Skincare',
                'slug': 'skincare',
                'description': 'Advanced Swiss botanical cellular treatments and restorative serums.',
                'image_url': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
            },
            {
                'name': 'Cosmetics',
                'slug': 'cosmetics',
                'description': 'Luminous silk foundations, velvet matte lip formulations, and 24K gold powders.',
                'image_url': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80'
            },
            {
                'name': 'Perfume',
                'slug': 'perfume',
                'description': 'Masterful artisanal extraits and pure parfums crafted with rare Alpine notes.',
                'image_url': 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80'
            }
        ]

        created_categories = {}
        for c in categories_data:
            cat, created = Category.objects.get_or_create(
                category_name=c['name'],
                defaults={'slug': c['slug']}
            )
            created_categories[c['slug']] = cat
            status = "Created" if created else "Found existing"
            self.stdout.write(f"  {status} category: {cat.category_name}")

        # 2. Luxury SwissMax Products
        products_data = [
            # Skincare
            {
                'category': 'skincare',
                'name': 'Swiss Glacier Cellular Serum',
                'price': 145,
                'description': 'Enriched with Alpine glacier water and botanical peptides to instantly restore cellular moisture and skin barrier vitality.',
                'image': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
            },
            {
                'category': 'skincare',
                'name': 'Alpine Botanical Recovery Oil',
                'price': 120,
                'description': 'Cold-pressed Alpine rosehip, squalane, and edelweiss extract to illuminate dull skin and smooth fine lines.',
                'image': 'https://images.unsplash.com/photo-1608248597359-009156477b79?auto=format&fit=crop&w=800&q=80'
            },
            {
                'category': 'skincare',
                'name': 'Crème de Edelweiss Intense',
                'price': 180,
                'description': 'Ultra-nourishing night cream powered by rare Swiss edelweiss cellular stem cells for profound overnight renewal.',
                'image': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
            },
            {
                'category': 'skincare',
                'name': 'Purifying Glacier Mineral Essence',
                'price': 95,
                'description': 'Micro-filtered thermal tonic that balances complexion pH and refines pore texture with Swiss mountain minerals.',
                'image': 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80'
            },

            # Cosmetics
            {
                'category': 'cosmetics',
                'name': 'Velvet Matte Royal Lip Elixir',
                'price': 65,
                'description': 'Intense pigmentation enriched with Swiss jojoba esters. Glides on weightlessly for a soft-focus velvet matte finish.',
                'image': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80'
            },
            {
                'category': 'cosmetics',
                'name': 'Luminous Silk Flawless Foundation',
                'price': 85,
                'description': 'Breathable second-skin coverage infused with micro-pearl pigments for an effortless, radiant complexion that lasts 24 hours.',
                'image': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
            },
            {
                'category': 'cosmetics',
                'name': '24K Gold Illuminating Compact',
                'price': 90,
                'description': 'Ultra-fine pressed powder infused with real 24-karat gold flakes to impart a warm, multidimensional candlelit glow.',
                'image': 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80'
            },
            {
                'category': 'cosmetics',
                'name': 'Haute Couture Eyeshadow Palette',
                'price': 110,
                'description': 'A curated symphony of nine neutral and metallic shades formulated with buttery mica for seamless blending.',
                'image': 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80'
            },

            # Perfume
            {
                'category': 'perfume',
                'name': 'Swiss Alchemist Extrait de Parfum',
                'price': 260,
                'description': 'An intoxicating composition of black amber, smoked cedarwood, saffron, and rare Swiss pine resin.',
                'image': 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'
            },
            {
                'category': 'perfume',
                'name': 'Golden Oud & Velvet Vanilla',
                'price': 285,
                'description': 'A sensual dance of aged Cambodian oud, Madagascar bourbon vanilla, golden honey, and warm tonka bean.',
                'image': 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80'
            },
            {
                'category': 'perfume',
                'name': 'Fleur de Neige Alpine Parfumerie',
                'price': 220,
                'description': 'Crisp Alpine morning captured in pure essence: frosted bergamot, white iris, neroli blossoms, and cashmere musk.',
                'image': 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80'
            },
            {
                'category': 'perfume',
                'name': 'Imperial Vetiver & Bergamot Cologne',
                'price': 195,
                'description': 'Refined Haitian vetiver laced with sparkling Italian bergamot, pink pepper, and Haitian vetiver root.',
                'image': 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'
            }
        ]

        for p_info in products_data:
            cat = created_categories[p_info['category']]
            prod, created = Product.objects.get_or_create(
                product_name=p_info['name'],
                defaults={
                    'category': cat,
                    'price': p_info['price'],
                    'product_description': p_info['description'],
                }
            )
            # update price and category if already existed
            prod.category = cat
            prod.price = p_info['price']
            prod.product_description = p_info['description']
            prod.save()

            # Create or update default image
            if not prod.product_images.exists():
                ProductImage.objects.create(product=prod, image=p_info['image'])
            
            status = "Created" if created else "Updated"
            self.stdout.write(f"  {status} product: {prod.product_name} (${prod.price})")

        # 3. Create or update Default HeroBanner matching Screenshot 1 (755.Boutique layout)
        banner = HeroBanner.objects.first()
        if not banner:
            banner = HeroBanner.objects.create()

        banner.title = "ICONIC BEAUTY"
        banner.subtitle = "Welcome to SwissMax Beauty We curate iconic brands that deserve attention."
        banner.button_text = "DISCOVER"
        banner.left_banner_url = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85"
        banner.right_banner_url = "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=85"
        banner.announcement_text = "Website Sale Up to 30% off + Free Shipping"
        banner.announcement_link_text = "shop now"
        banner.countdown_days = 22
        banner.countdown_hours = 9
        banner.countdown_minutes = 21
        banner.countdown_seconds = 37
        banner.is_active = True
        banner.save()

        self.stdout.write(self.style.SUCCESS("Successfully populated SwissMax Beauty data!"))
