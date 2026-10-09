from django.test import TestCase

from products.models import Category, Product


SUPABASE_URL = (
    "https://buxiqvlwqkufiiwlhjlt.supabase.co/storage/v1/object/public/"
    "ecommerce-media/uploads/0123456789abcdef0123456789abcdef.jpg"
)


class CreateProductApiTests(TestCase):
    def create(self, **overrides):
        data = {"name": "Glow Serum", "price": "150", "description": "Test", "category": "skincare"}
        data.update(overrides)
        return self.client.post("/api/products/create/", data)

    def test_default_categories_are_seeded_by_migration(self):
        self.assertEqual(
            set(Category.objects.values_list("slug", flat=True)),
            {"skincare", "cosmetics", "perfume"},
        )

    def test_created_product_is_persisted_and_listed(self):
        res = self.create()
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["product"]["category_slug"], "skincare")

        listed = self.client.get("/api/products/").json()["products"]
        self.assertEqual([p["name"] for p in listed], ["Glow Serum"])

    def test_image_url_is_saved_and_returned_unmangled(self):
        res = self.create(image_url=SUPABASE_URL)
        self.assertEqual(res.json()["product"]["image"], SUPABASE_URL)

        listed = self.client.get("/api/products/").json()["products"]
        self.assertEqual(listed[0]["image"], SUPABASE_URL)

    def test_duplicate_names_get_unique_slugs(self):
        first = self.create().json()["product"]
        second = self.create().json()["product"]
        self.assertEqual(first["slug"], "glow-serum")
        self.assertEqual(second["slug"], "glow-serum-2")
        self.assertEqual(Product.objects.count(), 2)

    def test_no_categories_returns_clear_error_instead_of_500(self):
        Category.objects.all().delete()
        res = self.create()
        self.assertEqual(res.status_code, 400)
        self.assertIn("categories", res.json()["error"])
        self.assertEqual(Product.objects.count(), 0)
