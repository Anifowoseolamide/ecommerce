import json
import os
import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from products.models import Product, Category, ProductImage
from home.models import HeroBanner


def banner_to_dict(banner):
    left_img = banner.left_banner_url
    if banner.left_banner_image:
        left_img = banner.left_banner_image.url
    
    right_img = banner.right_banner_url
    if banner.right_banner_image:
        right_img = banner.right_banner_image.url

    return {
        'id': str(banner.uid),
        'title': banner.title,
        'subtitle': banner.subtitle,
        'button_text': banner.button_text,
        'left_banner_image': left_img or '/media/images/banners/hero_skincare.jpg',
        'right_banner_image': right_img or '/media/images/banners/hero_perfume.jpg',
        'announcement_text': banner.announcement_text,
        'announcement_link_text': banner.announcement_link_text,
        'countdown_days': banner.countdown_days,
        'countdown_hours': banner.countdown_hours,
        'countdown_minutes': banner.countdown_minutes,
        'countdown_seconds': banner.countdown_seconds,
        'is_active': banner.is_active,
    }


def get_banners(request):
    """Retrieve the current active hero banner settings or default."""
    banner = HeroBanner.objects.filter(is_active=True).first()
    if not banner:
        banner = HeroBanner.objects.create(
            title="ICONIC BEAUTY",
            subtitle="Welcome to SwissMax Beauty — We curate iconic formulations that deserve attention.",
            button_text="DISCOVER",
            announcement_text="Website Sale Up to 30% off + Free Shipping",
            announcement_link_text="shop now",
            countdown_days=22,
            countdown_hours=9,
            countdown_minutes=21,
            countdown_seconds=37
        )
    return JsonResponse({'status': 'success', 'banner': banner_to_dict(banner)})


@csrf_exempt
def update_banner(request):
    """Update active banner data and banner images."""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)

    banner = HeroBanner.objects.filter(is_active=True).first()
    if not banner:
        banner = HeroBanner.objects.create()

    # Check for multipart files
    if 'left_image_file' in request.FILES:
        banner.left_banner_image = request.FILES['left_image_file']
        banner.left_banner_url = ""
    if 'right_image_file' in request.FILES:
        banner.right_banner_image = request.FILES['right_image_file']
        banner.right_banner_url = ""

    # Parse POST data (either from FormData or JSON)
    if request.content_type and 'application/json' in request.content_type:
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            data = {}
    else:
        data = request.POST

    if 'title' in data and data['title']:
        banner.title = data['title']
    if 'subtitle' in data and data['subtitle']:
        banner.subtitle = data['subtitle']
    if 'button_text' in data and data['button_text']:
        banner.button_text = data['button_text']
    if 'announcement_text' in data and data['announcement_text']:
        banner.announcement_text = data['announcement_text']
    if 'announcement_link_text' in data and data['announcement_link_text']:
        banner.announcement_link_text = data['announcement_link_text']
    if 'left_banner_url' in data and data['left_banner_url']:
        banner.left_banner_url = data['left_banner_url']
        banner.left_banner_image = None
    if 'right_banner_url' in data and data['right_banner_url']:
        banner.right_banner_url = data['right_banner_url']
        banner.right_banner_image = None
    if 'countdown_days' in data:
        try:
            banner.countdown_days = int(data['countdown_days'])
        except (ValueError, TypeError):
            pass
    if 'countdown_hours' in data:
        try:
            banner.countdown_hours = int(data['countdown_hours'])
        except (ValueError, TypeError):
            pass
    if 'countdown_minutes' in data:
        try:
            banner.countdown_minutes = int(data['countdown_minutes'])
        except (ValueError, TypeError):
            pass
    if 'countdown_seconds' in data:
        try:
            banner.countdown_seconds = int(data['countdown_seconds'])
        except (ValueError, TypeError):
            pass

    banner.save()
    return JsonResponse({'status': 'success', 'banner': banner_to_dict(banner)})


def get_categories(request):
    """Retrieve all categories with their product counts."""
    categories = Category.objects.all()
    data = []
    for c in categories:
        img_url = c.category_image.url if c.category_image else ""
        data.append({
            'id': str(c.uid),
            'name': c.category_name,
            'slug': c.slug,
            'image': img_url,
            'product_count': c.products.count()
        })
    return JsonResponse({'status': 'success', 'categories': data})


@csrf_exempt
def update_category(request, category_id):
    """Update a category's name or image."""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    
    try:
        category = Category.objects.get(uid=category_id)
    except Category.DoesNotExist:
        return JsonResponse({'error': 'Category not found'}, status=404)

    if 'image' in request.FILES:
        category.category_image = request.FILES['image']
    if 'category_name' in request.POST:
        category.category_name = request.POST['category_name']
    category.save()

    return JsonResponse({
        'status': 'success',
        'category': {
            'id': str(category.uid),
            'name': category.category_name,
            'slug': category.slug,
            'image': category.category_image.url if category.category_image else ''
        }
    })


def get_products(request):
    """Retrieve products, optionally filtered by category or search term."""
    category_slug = request.GET.get('category', '').strip()
    search_query = request.GET.get('q', '').strip()

    products = Product.objects.all().select_related('category').prefetch_related('product_images')

    if category_slug:
        products = products.filter(category__slug=category_slug)

    if search_query:
        products = products.filter(
            product_name__icontains=search_query
        ) | products.filter(
            product_description__icontains=search_query
        )

    data = []
    for p in products:
        images = []
        for img in p.product_images.all():
            if img.image:
                img_str = str(img.image)
                if img_str.startswith('http://') or img_str.startswith('https://'):
                    images.append(img_str)
                else:
                    images.append(img.image.url)
        
        main_img = images[0] if images else ""
        data.append({
            'id': str(p.uid),
            'name': p.product_name,
            'slug': p.slug,
            'price': p.price,
            'description': p.product_description,
            'category_name': p.category.category_name if p.category else 'Uncategorized',
            'category_slug': p.category.slug if p.category else '',
            'image': main_img,
            'images': images,
        })

    return JsonResponse({'status': 'success', 'products': data})


@csrf_exempt
def create_product(request):
    """Create a new product with optional image upload."""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)

    name = request.POST.get('name', '').strip()
    price = request.POST.get('price', 0)
    desc = request.POST.get('description', '').strip()
    category_slug = request.POST.get('category', '').strip()
    image_file = request.FILES.get('image')
    image_url = request.POST.get('image_url', '').strip()

    if not name:
        return JsonResponse({'error': 'Name is required'}, status=400)

    category = None
    if category_slug:
        category = Category.objects.filter(slug=category_slug).first()
    if not category:
        category = Category.objects.first()

    try:
        price_int = int(float(price))
    except (ValueError, TypeError):
        price_int = 100

    product = Product.objects.create(
        product_name=name,
        category=category,
        price=price_int,
        product_description=desc
    )

    if image_file:
        ProductImage.objects.create(product=product, image=image_file)
    elif image_url:
        # Note: image_url can be tracked
        pass

    return JsonResponse({
        'status': 'success',
        'product': {
            'id': str(product.uid),
            'name': product.product_name,
            'slug': product.slug,
            'price': product.price,
            'description': product.product_description,
            'category_name': product.category.category_name,
            'category_slug': product.category.slug,
            'image': product.product_images.first().image.url if product.product_images.first() else image_url
        }
    })


@csrf_exempt
def update_product(request, product_id):
    """Update a product's details and/or image."""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)

    try:
        product = Product.objects.get(uid=product_id)
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Product not found'}, status=404)

    if 'name' in request.POST and request.POST['name']:
        product.product_name = request.POST['name']
    if 'price' in request.POST and request.POST['price']:
        try:
            product.price = int(float(request.POST['price']))
        except ValueError:
            pass
    if 'description' in request.POST:
        product.product_description = request.POST['description']
    if 'category' in request.POST:
        cat = Category.objects.filter(slug=request.POST['category']).first()
        if cat:
            product.category = cat

    product.save()

    if 'image' in request.FILES:
        # Replace or add first image
        pimg = product.product_images.first()
        if pimg:
            pimg.image = request.FILES['image']
            pimg.save()
        else:
            ProductImage.objects.create(product=product, image=request.FILES['image'])

    first_img = product.product_images.first()
    return JsonResponse({
        'status': 'success',
        'product': {
            'id': str(product.uid),
            'name': product.product_name,
            'slug': product.slug,
            'price': product.price,
            'description': product.product_description,
            'category_name': product.category.category_name,
            'category_slug': product.category.slug,
            'image': first_img.image.url if first_img and first_img.image else ''
        }
    })


@csrf_exempt
def upload_file(request):
    """Upload general asset files to media/uploads/ and return public URL."""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)

    file_obj = request.FILES.get('file') or request.FILES.get('image')
    if not file_obj:
        return JsonResponse({'error': 'No file uploaded'}, status=400)

    filename = f"uploads/{uuid.uuid4()}_{file_obj.name}"
    saved_path = default_storage.save(filename, ContentFile(file_obj.read()))
    file_url = f"{settings.MEDIA_URL}{saved_path}"

    return JsonResponse({'status': 'success', 'url': file_url})
