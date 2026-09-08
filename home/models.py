from django.db import models
from base.models import BaseModel


class HeroBanner(BaseModel):
    title = models.CharField(max_length=255, default="ICONIC BEAUTY")
    subtitle = models.CharField(
        max_length=500, 
        default="Welcome to SwissMax Beauty — We curate iconic formulations that deserve attention."
    )
    button_text = models.CharField(max_length=100, default="DISCOVER")
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

