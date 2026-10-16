from django.contrib import admin
from .models import HeroBanner, HeritageSetting

@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display = ['title', 'announcement_text', 'is_active', 'updated_at']
    list_editable = ['is_active']

@admin.register(HeritageSetting)
class HeritageSettingAdmin(admin.ModelAdmin):
    list_display = ['title', 'subtitle', 'is_active', 'updated_at']
    list_editable = ['is_active']


