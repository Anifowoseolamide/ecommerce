from django.test import TestCase

# Create your tests here.


import json  # noqa: E402

from django.contrib.auth.models import User  # noqa: E402

from Ecommerce.api_views import MAX_ARTICLES, make_admin_token  # noqa: E402
from home.models import Article  # noqa: E402

IMG = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800"


def staff_headers():
    user = User.objects.create_user("editor", password="pw-123456", is_staff=True)
    return {"HTTP_AUTHORIZATION": f"Bearer {make_admin_token(user)}"}


class ArticleApiTests(TestCase):
    def test_existing_four_cards_are_seeded_in_order(self):
        data = self.client.get("/api/articles/").json()["articles"]
        self.assertEqual(len(data), 4)
        self.assertEqual(data[0]["title"], "The Alpine Glacial Sanctuary")
        self.assertEqual(data[3]["title"], "Artisanal 24K Gold Elixirs")
        self.assertTrue(all(a["image"].startswith("https://") for a in data))

    def test_create_edit_and_delete(self):
        headers = staff_headers()
        res = self.client.post("/api/articles/create/", {"title": "  New Launch ", "subtitle": "Just in", "image_url": IMG}, **headers)
        self.assertEqual(res.status_code, 200)
        article = res.json()["article"]
        self.assertEqual((article["title"], article["subtitle"], article["image"]), ("New Launch", "Just in", IMG))
        self.assertEqual(self.client.get("/api/articles/").json()["articles"][-1]["id"], article["id"], "new articles go last")

        res = self.client.post(f"/api/articles/update/{article['id']}/", {"title": "Renamed"}, **headers)
        self.assertEqual(res.json()["article"]["title"], "Renamed")
        self.assertEqual(res.json()["article"]["image"], IMG, "fields not sent are kept")

        res = self.client.post(f"/api/articles/delete/{article['id']}/", **headers)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(Article.objects.count(), 4)

    def test_validation(self):
        headers = staff_headers()
        create = lambda data: self.client.post("/api/articles/create/", data, **headers)  # noqa: E731
        self.assertEqual(create({"title": "", "image_url": IMG}).status_code, 400)
        self.assertEqual(create({"title": "No image"}).status_code, 400)
        self.assertEqual(create({"title": "Bad link", "image_url": "javascript:alert(1)"}).status_code, 400)
        article = Article.objects.first()
        self.assertEqual(self.client.post(f"/api/articles/update/{article.uid}/", {"title": " "}, **headers).status_code, 400)
        self.assertEqual(Article.objects.count(), 4)

    def test_article_limit(self):
        headers = staff_headers()
        for i in range(MAX_ARTICLES - 4):
            self.assertEqual(self.client.post("/api/articles/create/", {"title": f"A{i}", "image_url": IMG}, **headers).status_code, 200)
        res = self.client.post("/api/articles/create/", {"title": "One too many", "image_url": IMG}, **headers)
        self.assertEqual(res.status_code, 400)
        self.assertIn(str(MAX_ARTICLES), res.json()["error"])

    def test_writes_require_an_admin_token(self):
        article = Article.objects.first()
        for url in ["/api/articles/create/", f"/api/articles/update/{article.uid}/", f"/api/articles/delete/{article.uid}/"]:
            self.assertEqual(self.client.post(url, {"title": "x", "image_url": IMG}).status_code, 401, url)
        self.assertEqual(Article.objects.count(), 4)
