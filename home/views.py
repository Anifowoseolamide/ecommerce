from django.shortcuts import render
from products.models import Product, Category
from home.models import HeroBanner


def index(request):
    products = Product.objects.all()[:12]
    categories = Category.objects.filter(slug__in=['skincare', 'cosmetics', 'perfume'])
    if not categories.exists():
        categories = Category.objects.all()[:6]
    banner = HeroBanner.objects.filter(is_active=True).first()
    context = {
        'products': products,
        'categories': categories,
        'banner': banner,
    }
    return render(request, 'home/index.html', context)



def search(request):
    query = request.GET.get('q', '').strip()
    products = Product.objects.none()
    
    if query:
        products = Product.objects.filter(
            product_name__icontains=query
        ) | Product.objects.filter(
            product_description__icontains=query
        )
    
    context = {
        'products': products,
        'query': query
    }
    return render(request, 'home/search.html', context)