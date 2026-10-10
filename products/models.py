from django.db import models
from base.models import BaseModel
from django.utils.text import slugify


class Category(BaseModel):
    category_name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, null=True, blank=True)
    # Holds either a local file path or a full Supabase/external URL (which can exceed 100 chars)
    category_image = models.ImageField(upload_to="categories", max_length=500)

    def save(self, *args, **kwargs):
        self.slug = slugify(self.category_name)
        super(Category, self).save(*args, **kwargs)

    def __str__(self) -> str:
        return self.category_name

class ColorVariant(BaseModel):
    color_name = models.CharField(max_length=100)
    price = models.IntegerField(default=0)
    
    def __str__(self) -> str:
        return self.color_name

class SizeVariant(BaseModel):
    size = models.CharField(max_length=100)
    price = models.IntegerField(default=0)

    def __str__(self) -> str:
        return self.size

# Badge shown on the product photo in the store
PRODUCT_TAG_CHOICES = [
    ("New", "New"),
    ("Limited Edition", "Limited Edition"),
    ("Sale", "Sale"),
]


class Product(BaseModel):
    product_name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="products")
    price = models.IntegerField()
    product_description = models.TextField()    
    tag = models.CharField(max_length=30, choices=PRODUCT_TAG_CHOICES, blank=True, default="")
    color_variant = models.ManyToManyField(ColorVariant, blank= True)
    size_variant = models.ManyToManyField(SizeVariant, blank= True)

    def save(self, *args, **kwargs):
        # Slug must be unique, so suffix it when another product already has the same name
        base_slug = slugify(self.product_name) or "product"
        slug = base_slug
        n = 2
        while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
            slug = f"{base_slug}-{n}"
            n += 1
        self.slug = slug
        super(Product, self).save(*args, **kwargs)

    def __str__(self) -> str:
        return self.product_name
    
    def get_product_price_by_size(self, size):
        return self.price + SizeVariant.objects.get(size = size).price
    
    def get_product_price_by_color(self, color_name):
        return self.price + ColorVariant.objects.get(color_name = color_name).price




class ProductImage(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="product_images")
    # Holds either a local file path or a full Supabase/external URL (which can exceed 100 chars)
    image = models.ImageField(upload_to="product", max_length=500)
    color_variant = models.ForeignKey(ColorVariant, on_delete=models.SET_NULL, null=True, blank=True, related_name="product_images")
    