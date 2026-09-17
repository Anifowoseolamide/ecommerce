from django.contrib import admin
from .models import Category, Product, ProductImage, ColorVariant, SizeVariant

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['category_name', 'slug', 'create_at']
    search_fields = ['category_name', 'slug']
    prepopulated_fields = {'slug': ('category_name',)}
    readonly_fields = ['uid', 'create_at', 'updated_at']

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['product_name', 'category', 'price', 'create_at']
    list_filter = ['category', 'create_at']
    search_fields = ['product_name', 'product_description']
    prepopulated_fields = {'slug': ('product_name',)}
    inlines = [ProductImageInline]
    readonly_fields = ['uid', 'create_at', 'updated_at']

@admin.register(ColorVariant)
class ColorVariantAdmin(admin.ModelAdmin):
    list_display = ['color_name', 'price', 'create_at']
    search_fields = ['color_name']

@admin.register(SizeVariant)
class SizeVariantAdmin(admin.ModelAdmin):
    list_display = ['size', 'price', 'create_at']
    search_fields = ['size']

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'color_variant', 'create_at']
    list_filter = ['product', 'color_variant']

