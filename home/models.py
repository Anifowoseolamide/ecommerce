from django.db import models
from base.models import BaseModel


class HeroBanner(BaseModel):
    title = models.CharField(max_length=255, default="ICONIC BEAUTY")
    subtitle = models.CharField(
        max_length=500, 
        default="Welcome to SwissMax Beauty — We curate iconic formulations that deserve attention."
    )
    button_text = models.CharField(max_length=100, default="DISCOVER")
    right_title = models.CharField(max_length=255, default="ATELIER RESERVES", blank=True)
    right_eyebrow = models.CharField(max_length=255, default="Limited Release", blank=True)
    left_banner_image = models.ImageField(upload_to="banners", null=True, blank=True)
    left_banner_url = models.CharField(max_length=1000, null=True, blank=True)
    right_banner_image = models.ImageField(upload_to="banners", null=True, blank=True)
    right_banner_url = models.CharField(max_length=1000, null=True, blank=True)
    announcement_text = models.CharField(
        max_length=300, 
        default="Website Sale Up to 30% off + Free Shipping"
    )
    announcement_link_text = models.CharField(max_length=100, default="shop now")
    countdown_days = models.IntegerField(default=22)
    countdown_hours = models.IntegerField(default=9)
    countdown_minutes = models.IntegerField(default=21)
    countdown_seconds = models.IntegerField(default=37)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Hero Banner ({self.title})"


class HeritageSetting(BaseModel):
    title = models.CharField(
        max_length=255, 
        default="BEAUTY BRANDS YOU CAN TRUST AT THE BEST PRICE"
    )
    subtitle = models.CharField(
        max_length=255, 
        default="ORIGINAL. AFFORDABLE. PRISTINE"
    )
    badge_text = models.CharField(
        max_length=255, 
        default="SwissMax Beauty . Tradefair, Lagos"
    )
    body = models.TextField(
        default="Founded in 2022 in Lagos Nigeria, SwissMax Beauty Group LTD curates and imports exceptional, high-in-demand and effective Beauty products directly from original Manufacturers, making them available to our customers at highly competitive prices"
    )
    image = models.ImageField(upload_to="heritage", null=True, blank=True)
    image_url = models.CharField(
        max_length=1000, 
        default="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=85",
        blank=True
    )
    button_text = models.CharField(max_length=100, default="EXPLORE OUR PRODUCTS")

    stat_1_val = models.CharField(max_length=100, default="100%")
    stat_1_lbl = models.CharField(max_length=200, default="Original Product Manufacturer")
    stat_2_val = models.CharField(max_length=100, default="98.7%")
    stat_2_lbl = models.CharField(max_length=200, default="Affordability Rating")
    stat_3_val = models.CharField(max_length=100, default="Bulk Orders")
    stat_3_lbl = models.CharField(max_length=200, default="Global Supply to Resellers")

    pillar_1 = models.CharField(max_length=255, default="Certified distributor of over 30 OPM")
    pillar_2 = models.CharField(max_length=255, default="Western Africa wide Delivery")
    pillar_3 = models.CharField(max_length=255, default="Thailand, Korea, USA Products.")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Heritage Section ({self.title})"


