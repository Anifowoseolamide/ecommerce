from django.core.management.base import BaseCommand
from products.models import Category
from home.models import HeroBanner


class Command(BaseCommand):
    help = 'Populates the database with SwissMax Beauty categories and hero banner settings (no sample products)'

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

        for c in categories_data:
            cat, created = Category.objects.get_or_create(
                category_name=c['name'],
                defaults={'slug': c['slug']}
            )
            status = "Created" if created else "Found existing"
            self.stdout.write(f"  {status} category: {cat.category_name}")

        # 2. Create or update Default HeroBanner matching Screenshot 1 (755.Boutique layout)
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
