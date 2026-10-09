import json
import os
import uuid
from functools import wraps
from django.contrib.auth import get_user_model
from django.core import signing
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.db import transaction
from products.models import Product, Category, ProductImage
from home.models import HeroBanner
from Ecommerce.supabase_storage import upload_to_supabase


def image_field_url(field):
    """Return a usable URL for an ImageField holding either a local file or a full URL.

    `.url` mangles stored absolute URLs (e.g. Supabase) into '/media/https%3A/...',
    so those are returned as-is.
    """
    if not field:
        return ''
    value = str(field)
    if value.startswith('http://') or value.startswith('https://'):
        return value
    return field.url


# Admin API auth: login returns a signed token that the dashboard sends as
# "Authorization: Bearer <token>". Signed with SECRET_KEY, so rotating it logs everyone out.
ADMIN_TOKEN_SALT = 'swissmax.admin-api'
ADMIN_TOKEN_MAX_AGE = 60 * 60 * 12  # 12 hours


def make_admin_token(user):
    return signing.dumps({'uid': user.pk}, salt=ADMIN_TOKEN_SALT)


def staff_required(view):
    """Reject the request unless it carries a valid, unexpired token for an active staff user."""
    @wraps(view)
    def wrapper(request, *args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer ') or not auth_header[7:].strip():
            return JsonResponse({'error': 'Admin login required.'}, status=401)
        try:
            data = signing.loads(auth_header[7:].strip(), salt=ADMIN_TOKEN_SALT, max_age=ADMIN_TOKEN_MAX_AGE)
            user = get_user_model().objects.get(pk=data['uid'], is_active=True)
        except (signing.BadSignature, KeyError, TypeError, get_user_model().DoesNotExist):
            # BadSignature also covers SignatureExpired
            return JsonResponse({'error': 'Admin session expired or invalid. Please log in again.'}, status=401)
        if not (user.is_staff or user.is_superuser):
            return JsonResponse({'error': 'Admin privileges required.'}, status=403)
        request.user = user
        return view(request, *args, **kwargs)
    return wrapper


def banner_to_dict(banner):
    left_img = banner.left_banner_url
    if banner.left_banner_image:
        left_img = banner.left_banner_image.url
    
    right_img = banner.right_banner_url
    if banner.right_banner_image:
        right_img = banner.right_banner_image.url

    # Query all active HeroBanner records to generate dynamic slides
    active_banners = HeroBanner.objects.filter(is_active=True).order_by('create_at')
    slides = []
    for idx, b in enumerate(active_banners):
        b_left = b.left_banner_image.url if b.left_banner_image else (b.left_banner_url or 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=85')
        b_right = b.right_banner_image.url if b.right_banner_image else (b.right_banner_url or 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85')
        slides.append({
            'id': str(b.uid),
            'title': b.title,
            'subtitle': b.subtitle,
            'button_text': b.button_text,
            'left_banner_image': b_left,
            'right_banner_image': b_right,
            'right_title': 'ATELIER RESERVES',
            'right_eyebrow': 'Limited Release'
        })

    if not slides:
        slides = [{
            'id': str(banner.uid),
            'title': banner.title,
            'subtitle': banner.subtitle,
            'button_text': banner.button_text,
            'left_banner_image': left_img or 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=85',
            'right_banner_image': right_img or 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85',
            'right_title': 'ATELIER RESERVES',
            'right_eyebrow': 'Limited Release'
        }]

    return {
        'id': str(banner.uid),
        'title': banner.title,
        'subtitle': banner.subtitle,
        'button_text': banner.button_text,
        'left_banner_image': left_img or slides[0]['left_banner_image'],
        'right_banner_image': right_img or slides[0]['right_banner_image'],
        'slides': slides,
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
@staff_required
def update_banner(request):
    """Update active banner data and banner images."""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)

    banner = HeroBanner.objects.filter(is_active=True).first()
    if not banner:
        banner = HeroBanner.objects.create()

    # Handle banner image uploads — try Supabase first, fall back to local storage
    if 'left_image_file' in request.FILES:
        f = request.FILES['left_image_file']
        supabase_url = upload_to_supabase(f, f.name, folder='banners')
        if supabase_url:
            banner.left_banner_url = supabase_url
            banner.left_banner_image = None
        else:
            banner.left_banner_image = f
        banner.left_banner_url = supabase_url or ""
    if 'right_image_file' in request.FILES:
        f = request.FILES['right_image_file']
        supabase_url = upload_to_supabase(f, f.name, folder='banners')
        if supabase_url:
            banner.right_banner_url = supabase_url
            banner.right_banner_image = None
        else:
            banner.right_banner_image = f
        banner.right_banner_url = supabase_url or ""

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
        img_url = image_field_url(c.category_image)
        data.append({
            'id': str(c.uid),
            'name': c.category_name,
            'slug': c.slug,
            'image': img_url,
            'product_count': c.products.count()
        })
    return JsonResponse({'status': 'success', 'categories': data})


@csrf_exempt
@staff_required
def update_category(request, category_id):
    """Update a category's name or image."""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)
    
    try:
        category = Category.objects.get(uid=category_id)
    except Category.DoesNotExist:
        return JsonResponse({'error': 'Category not found'}, status=404)

    if 'image' in request.FILES:
        f = request.FILES['image']
        supabase_url = upload_to_supabase(f, f.name, folder='categories')
        if supabase_url:
            category.category_image = supabase_url
        else:
            category.category_image = f
    if 'category_name' in request.POST:
        category.category_name = request.POST['category_name']
    category.save()

    return JsonResponse({
        'status': 'success',
        'category': {
            'id': str(category.uid),
            'name': category.category_name,
            'slug': category.slug,
            'image': image_field_url(category.category_image)
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
        images = [image_field_url(img.image) for img in p.product_images.all() if img.image]

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
@staff_required
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
    if not category:
        # Product.category is required — without this check the insert fails with a 500
        return JsonResponse({'error': 'No categories exist. Run "python manage.py migrate" to create the defaults.'}, status=400)

    try:
        price_int = int(float(price))
    except (ValueError, TypeError):
        price_int = 100

    # Product and its image are saved together so a failed image save doesn't leave a half-created product
    with transaction.atomic():
        product = Product.objects.create(
            product_name=name,
            category=category,
            price=price_int,
            product_description=desc
        )

        if image_file:
            f = image_file
            supabase_url = upload_to_supabase(f, f.name, folder='products')
            if supabase_url:
                ProductImage.objects.create(product=product, image=supabase_url)
            else:
                ProductImage.objects.create(product=product, image=f)
        elif image_url.startswith('http://') or image_url.startswith('https://'):
            # The dashboard uploads the file first and sends back the resulting URL
            ProductImage.objects.create(product=product, image=image_url)

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
            'image': image_field_url(first_img.image) if first_img else image_url
        }
    })


@csrf_exempt
@staff_required
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
        # Replace or add first image via file upload — try Supabase first
        f = request.FILES['image']
        supabase_url = upload_to_supabase(f, f.name, folder='products')
        pimg = product.product_images.first()
        if pimg:
            pimg.image = supabase_url or f
            pimg.save()
        else:
            img_val = supabase_url or f
            ProductImage.objects.create(product=product, image=img_val)
    elif 'image_url' in request.POST and request.POST['image_url']:
        # Accept image URL string from the dashboard (no file upload)
        image_url = request.POST['image_url']
        pimg = product.product_images.first()
        if pimg:
            pimg.image = image_url
            pimg.save()
        else:
            ProductImage.objects.create(product=product, image=image_url)

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
            'image': image_field_url(first_img.image) if first_img else ''
        }
    })


@csrf_exempt
@staff_required
def delete_product(request, product_id):
    """Delete a product and all its images from the database."""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)

    try:
        product = Product.objects.get(uid=product_id)
    except Product.DoesNotExist:
        return JsonResponse({'error': 'Product not found'}, status=404)

    product_name = product.product_name
    product.product_images.all().delete()
    product.delete()

    return JsonResponse({'status': 'success', 'deleted': product_name})


@csrf_exempt
@staff_required
def upload_file(request):
    """Upload general asset files to Supabase Storage (with local fallback)."""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=405)

    file_obj = request.FILES.get('file') or request.FILES.get('image')
    if not file_obj:
        return JsonResponse({'error': 'No file uploaded'}, status=400)

    # Try Supabase Storage first
    supabase_url = upload_to_supabase(file_obj, file_obj.name, folder='uploads')
    if supabase_url:
        return JsonResponse({'status': 'success', 'url': supabase_url})

    # Fallback: save to local media storage
    file_obj.seek(0)  # reset after potential read in upload_to_supabase
    filename = f"uploads/{uuid.uuid4()}_{file_obj.name}"
    saved_path = default_storage.save(filename, ContentFile(file_obj.read()))
    file_url = f"{settings.MEDIA_URL}{saved_path}"
    return JsonResponse({'status': 'success', 'url': file_url})


@csrf_exempt
def api_admin_login(request):
    """Authenticate staff / superuser for the frontend admin dashboard."""
    from django.contrib.auth import authenticate

    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'POST required'}, status=405)

    if request.content_type and 'application/json' in request.content_type:
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            data = {}
    else:
        data = request.POST

    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return JsonResponse({'success': False, 'error': 'Username and password are required.'}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is not None:
        if user.is_staff or user.is_superuser:
            return JsonResponse({
                'success': True,
                'token': make_admin_token(user),
                'user': {
                    'username': user.username,
                    'is_superuser': user.is_superuser,
                    'is_staff': user.is_staff,
                }
            })
        else:
            return JsonResponse({'success': False, 'error': 'Access denied: Admin privileges required.'}, status=403)
    else:
        return JsonResponse({'success': False, 'error': 'Invalid username or password.'}, status=401)

