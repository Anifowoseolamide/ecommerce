from django.db import migrations


# Must match the category options offered by the dashboard's "Add Product" form
DEFAULT_CATEGORIES = [
    ("Skincare", "skincare"),
    ("Cosmetics", "cosmetics"),
    ("Perfume", "perfume"),
]


def seed_default_categories(apps, schema_editor):
    Category = apps.get_model("products", "Category")
    for name, slug in DEFAULT_CATEGORIES:
        # Historical models don't run Category.save(), so the slug is set explicitly
        if not Category.objects.filter(slug=slug).exists():
            Category.objects.create(category_name=name, slug=slug)


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0004_image_url_max_length"),
    ]

    operations = [
        # Reverse is a no-op: deleting categories would cascade-delete their products
        migrations.RunPython(seed_default_categories, migrations.RunPython.noop),
    ]
