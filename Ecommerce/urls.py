"""
URL configuration for Ecommerce project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static 
from django.conf import settings
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from django.shortcuts import redirect
from Ecommerce import api_views

def redirect_to_frontend(request):
    return redirect("https://swissmax.netlify.app/")

urlpatterns = [
    path("", redirect_to_frontend, name="root_redirect"),
    path("legacy-home/", include('home.urls')),
    path("product/", include('products.urls')),

    path("admin/", admin.site.urls),
    path("accounts/", include("accounts.urls")),
    path("cart/", include("cart.urls")),
    # REST API endpoints for SwissMax React frontend & Dashboard
    path("api/banners/", api_views.get_banners, name="api_get_banners"),
    path("api/banners/update/", api_views.update_banner, name="api_update_banner"),
    path("api/categories/", api_views.get_categories, name="api_get_categories"),
    path("api/categories/update/<uuid:category_id>/", api_views.update_category, name="api_update_category"),
    path("api/products/", api_views.get_products, name="api_get_products"),
    path("api/products/create/", api_views.create_product, name="api_create_product"),
    path("api/products/update/<uuid:product_id>/", api_views.update_product, name="api_update_product"),
    path("api/upload/", api_views.upload_file, name="api_upload_file"),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, 
                          document_root = settings.MEDIA_ROOT)

urlpatterns += staticfiles_urlpatterns()