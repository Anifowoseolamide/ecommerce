import json
from unittest import mock

from django.contrib.auth.models import User
from django.core import signing
from django.test import TestCase

from Ecommerce.api_views import ADMIN_TOKEN_MAX_AGE, make_admin_token
from products.models import Category, Product


SUPABASE_URL = (
    "https://buxiqvlwqkufiiwlhjlt.supabase.co/storage/v1/object/public/"
    "ecommerce-media/uploads/0123456789abcdef0123456789abcdef.jpg"
)


def auth_header(user):
    return {"HTTP_AUTHORIZATION": f"Bearer {make_admin_token(user)}"}


class CreateProductApiTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user("admin", password="pw-123456", is_staff=True)

    def create(self, **overrides):
        data = {"name": "Glow Serum", "price": "150", "description": "Test", "category": "skincare"}
        data.update(overrides)
        return self.client.post("/api/products/create/", data, **auth_header(self.admin))

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


class AdminApiAuthTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user("admin", password="pw-123456", is_staff=True)
        self.customer = User.objects.create_user("customer", password="pw-123456")
        self.product = Product.objects.create(
            product_name="Glow Serum", category=Category.objects.get(slug="skincare"),
            price=150, product_description="Test",
        )

    def write_endpoints(self):
        return [
            "/api/products/create/",
            f"/api/products/update/{self.product.uid}/",
            f"/api/products/delete/{self.product.uid}/",
            f"/api/categories/update/{Category.objects.first().uid}/",
            "/api/banners/update/",
            "/api/upload/",
        ]

    def test_write_endpoints_reject_missing_token(self):
        for url in self.write_endpoints():
            res = self.client.post(url, {"name": "Hacked"})
            self.assertEqual(res.status_code, 401, url)
            self.assertEqual(res.json()["error"], "Admin login required.", url)
        self.assertTrue(Product.objects.filter(pk=self.product.pk, product_name="Glow Serum").exists())

    def test_write_endpoints_reject_forged_token(self):
        forged = signing.dumps({"uid": self.admin.pk}, key="not-the-real-secret-key", salt="swissmax.admin-api")
        for url in self.write_endpoints():
            res = self.client.post(url, {"name": "Hacked"}, HTTP_AUTHORIZATION=f"Bearer {forged}")
            self.assertEqual(res.status_code, 401, url)
            self.assertIn("expired or invalid", res.json()["error"], url)

    def test_expired_token_is_rejected(self):
        token = make_admin_token(self.admin)
        with mock.patch("time.time", return_value=signing.time.time() + ADMIN_TOKEN_MAX_AGE + 60):
            res = self.client.post("/api/products/create/", {"name": "Late"}, HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(res.status_code, 401)

    def test_non_staff_token_is_forbidden(self):
        res = self.client.post(f"/api/products/delete/{self.product.uid}/", **auth_header(self.customer))
        self.assertEqual(res.status_code, 403)
        self.assertTrue(Product.objects.filter(pk=self.product.pk).exists())

    def test_deactivated_admin_token_is_rejected(self):
        headers = auth_header(self.admin)
        self.admin.is_active = False
        self.admin.save()
        res = self.client.post(f"/api/products/delete/{self.product.uid}/", **headers)
        self.assertEqual(res.status_code, 401)

    def test_staff_token_can_delete(self):
        res = self.client.post(f"/api/products/delete/{self.product.uid}/", **auth_header(self.admin))
        self.assertEqual(res.status_code, 200)
        self.assertFalse(Product.objects.filter(pk=self.product.pk).exists())

    def test_read_endpoints_stay_public(self):
        for url in ["/api/products/", "/api/categories/", "/api/banners/"]:
            self.assertEqual(self.client.get(url).status_code, 200, url)

    def test_login_returns_working_token_for_staff_only(self):
        res = self.client.post("/api/admin/login/", json.dumps({"username": "admin", "password": "pw-123456"}),
                               content_type="application/json")
        token = res.json()["token"]
        res = self.client.post(f"/api/products/delete/{self.product.uid}/", HTTP_AUTHORIZATION=f"Bearer {token}")
        self.assertEqual(res.status_code, 200)

        res = self.client.post("/api/admin/login/", json.dumps({"username": "customer", "password": "pw-123456"}),
                               content_type="application/json")
        self.assertEqual(res.status_code, 403)
        self.assertNotIn("token", res.json())


class ProductTagTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user("admin", password="pw-123456", is_staff=True)

    def create(self, **fields):
        data = {"name": "Glow Serum", "price": "150", "category": "skincare", **fields}
        return self.client.post("/api/products/create/", data, **auth_header(self.admin))

    def test_tag_is_saved_and_listed(self):
        res = self.create(tag="Limited Edition")
        self.assertEqual(res.json()["product"]["tag"], "Limited Edition")
        self.assertEqual(self.client.get("/api/products/").json()["products"][0]["tag"], "Limited Edition")

    def test_no_tag_by_default(self):
        self.assertEqual(self.create().json()["product"]["tag"], "")

    def test_unknown_tag_is_rejected(self):
        res = self.create(tag="Free Gift")
        self.assertEqual(res.status_code, 400)
        self.assertEqual(Product.objects.count(), 0)

    def test_update_changes_and_clears_tag(self):
        uid = self.create(tag="New").json()["product"]["id"]
        url = f"/api/products/update/{uid}/"
        self.assertEqual(self.client.post(url, {"tag": "Sale"}, **auth_header(self.admin)).json()["product"]["tag"], "Sale")
        self.assertEqual(self.client.post(url, {"tag": ""}, **auth_header(self.admin)).json()["product"]["tag"], "")
        self.assertEqual(self.client.post(url, {"tag": "Bogus"}, **auth_header(self.admin)).status_code, 400)
        self.assertEqual(Product.objects.get(uid=uid).tag, "")

    def test_update_without_tag_field_keeps_tag(self):
        uid = self.create(tag="Sale").json()["product"]["id"]
        self.client.post(f"/api/products/update/{uid}/", {"name": "Renamed"}, **auth_header(self.admin))
        self.assertEqual(Product.objects.get(uid=uid).tag, "Sale")


class CategoryUpdateApiTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user("admin", password="pw-123456", is_staff=True)
        self.category = Category.objects.get(slug="skincare")
        self.url = f"/api/categories/update/{self.category.uid}/"

    def post(self, data):
        return self.client.post(self.url, data, **auth_header(self.admin))

    def test_image_link_and_tagline_are_saved_and_listed(self):
        res = self.post({"image_url": SUPABASE_URL, "description": "  Original products you can trust.  "})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["category"]["image"], SUPABASE_URL)

        listed = {c["slug"]: c for c in self.client.get("/api/categories/").json()["categories"]}
        self.assertEqual(listed["skincare"]["image"], SUPABASE_URL)
        self.assertEqual(listed["skincare"]["description"], "Original products you can trust.")

    def test_non_http_image_link_is_rejected(self):
        res = self.post({"image_url": "data:image/png;base64,AAAA"})
        self.assertEqual(res.status_code, 400)
        self.category.refresh_from_db()
        self.assertFalse(self.category.category_image)

    def test_update_without_fields_keeps_existing_values(self):
        self.post({"image_url": SUPABASE_URL, "description": "Keep me"})
        self.post({})
        self.category.refresh_from_db()
        self.assertEqual((str(self.category.category_image), self.category.description), (SUPABASE_URL, "Keep me"))

    def test_requires_admin_token(self):
        self.assertEqual(self.client.post(self.url, {"description": "x"}).status_code, 401)
