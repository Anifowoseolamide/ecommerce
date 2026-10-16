from django.db import migrations


# The four cards the storefront showed before articles became editable
DEFAULT_ARTICLES = [
    ("The Alpine Glacial Sanctuary", "Pristine Swiss Glacial Mineral Hydration",
     "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=85"),
    ("Haute Parfumerie Flacons", "Distilled Rare Alpine Woods & Resins",
     "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85"),
    ("Velvet Couture Complexion", "Luminous Micro-Silk Infusions",
     "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=85"),
    ("Artisanal 24K Gold Elixirs", "Crafted in Swiss Alpine Laboratories",
     "https://images.unsplash.com/photo-1512290900672-1f55a1d7f642?auto=format&fit=crop&w=900&q=85"),
]


def seed_articles(apps, schema_editor):
    Article = apps.get_model("home", "Article")
    if Article.objects.exists():
        return
    for position, (title, subtitle, image) in enumerate(DEFAULT_ARTICLES, start=1):
        Article.objects.create(title=title, subtitle=subtitle, image=image, position=position)


class Migration(migrations.Migration):

    dependencies = [
        ("home", "0004_article"),
    ]

    operations = [
        # Reverse is a no-op so rolling back never deletes articles an admin has written
        migrations.RunPython(seed_articles, migrations.RunPython.noop),
    ]
