from django.contrib import admin
from .models import CheckoutSettings, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'product_name', 'unit_price', 'quantity']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['reference', 'customer_name', 'customer_phone', 'total', 'status', 'create_at']
    list_filter = ['status', 'create_at']
    search_fields = ['reference', 'customer_name', 'customer_phone']
    inlines = [OrderItemInline]
    readonly_fields = ['uid', 'reference', 'total', 'create_at', 'updated_at']


@admin.register(CheckoutSettings)
class CheckoutSettingsAdmin(admin.ModelAdmin):
    list_display = ['whatsapp_number', 'bank_name', 'account_number', 'account_name']
