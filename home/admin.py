from django.contrib import admin
from .models import HeroBanner

@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'announcement_text', 'is_active', 'updated_at']
    list_editable = ['is_active']

