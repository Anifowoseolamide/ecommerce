from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_email_verified', 'phone_number', 'city', 'state', 'country', 'create_at']
    list_filter = ['is_email_verified', 'country', 'state', 'create_at']
    search_fields = ['user__username', 'user__email', 'phone_number', 'city', 'state']
    readonly_fields = ['uid', 'create_at', 'updated_at']