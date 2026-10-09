import json

from django.contrib.auth.models import User
from django.test import TestCase

from Ecommerce.api_views import make_admin_token
from orders.models import CheckoutSettings, Order, normalize_whatsapp_number
from products.models import Category, Product


def auth_header(user):
    return {"HTTP_AUTHORIZATION": f"Bearer {make_admin_token(user)}"}


class CreateOrderTests(TestCase):
    def setUp(self):
        category = Category.objects.get(slug="perfume")
        self.rebel = Product.objects.create(product_name="9PM Rebel", category=category, price=1500, product_description="")
        self.oud = Product.objects.create(product_name="Golden Oud", category=category, price=20000, product_description="")
        CheckoutSettings.objects.create(whatsapp_number="2348031234567", bank_name="GTBank",
                                        account_number="0123456789", account_name="SwissMax Beauty")

    def place(self, items, **customer):
        body = {"name": "Ada Obi", "phone": "0803 123 4567", "address": "12 Allen Ave, Ikeja", "items": items}
        body.update(customer)
        return self.client.post("/api/orders/create/", json.dumps(body), content_type="application/json")

    def test_order_is_saved_with_server_side_prices(self):
        res = self.place([
            {"product_id": str(self.rebel.uid), "quantity": 3, "price": 1},  # client price is ignored
            {"product_id": str(self.oud.uid), "quantity": 1},
        ])
        self.assertEqual(res.status_code, 200)
        order = res.json()["order"]
        self.assertEqual(order["total"], 3 * 1500 + 20000)
        self.assertRegex(order["reference"], r"^SMX-[A-Z2-9]{6}$")
        self.assertEqual(res.json()["payment"]["account_number"], "0123456789")

        saved = Order.objects.get(reference=order["reference"])
        self.assertEqual(saved.status, "new")
        self.assertEqual(saved.items.get(product=self.rebel).unit_price, 1500)

    def test_duplicate_lines_are_merged(self):
        res = self.place([{"product_id": str(self.rebel.uid), "quantity": 1},
                          {"product_id": str(self.rebel.uid), "quantity": 2}])
        items = res.json()["order"]["items"]
        self.assertEqual([(i["name"], i["quantity"]) for i in items], [("9PM Rebel", 3)])

    def test_order_keeps_product_snapshot_after_product_changes(self):
        res = self.place([{"product_id": str(self.rebel.uid), "quantity": 2}])
        self.rebel.price = 9999
        self.rebel.save()
        self.rebel.delete()
        item = Order.objects.get(reference=res.json()["order"]["reference"]).items.get()
        self.assertEqual((item.product, item.product_name, item.unit_price), (None, "9PM Rebel", 1500))

    def test_unknown_and_legacy_demo_ids_are_reported_unavailable(self):
        missing = "00000000-0000-4000-8000-000000000000"
        res = self.place([{"product_id": "prod-1", "quantity": 1},
                          {"product_id": missing, "quantity": 1},
                          {"product_id": str(self.rebel.uid), "quantity": 1}])
        self.assertEqual(res.status_code, 400)
        self.assertCountEqual(res.json()["unavailable"], ["prod-1", missing])
        self.assertEqual(Order.objects.count(), 0)

    def test_missing_customer_details_are_rejected(self):
        for field in ["name", "phone", "address"]:
            res = self.place([{"product_id": str(self.rebel.uid), "quantity": 1}], **{field: "  "})
            self.assertEqual(res.status_code, 400, field)
        self.assertEqual(Order.objects.count(), 0)

    def test_invalid_quantities_and_empty_bag_are_rejected(self):
        for items in [[], [{"product_id": str(self.rebel.uid), "quantity": 0}],
                      [{"product_id": str(self.rebel.uid), "quantity": 1001}],
                      [{"product_id": str(self.rebel.uid), "quantity": "lots"}]]:
            self.assertEqual(self.place(items).status_code, 400, items)
        self.assertEqual(Order.objects.count(), 0)


class OrderAdminApiTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user("admin", password="pw-123456", is_staff=True)
        self.order = Order.objects.create(customer_name="Ada", customer_phone="0803", delivery_address="Ikeja", total=1500)

    def test_order_admin_endpoints_require_staff_token(self):
        self.assertEqual(self.client.get("/api/orders/").status_code, 401)
        self.assertEqual(self.client.post(f"/api/orders/{self.order.uid}/status/", "{}", content_type="application/json").status_code, 401)
        self.assertEqual(self.client.get("/api/checkout-settings/").status_code, 401)

    def test_staff_can_list_orders_and_update_status(self):
        listed = self.client.get("/api/orders/", **auth_header(self.admin)).json()["orders"]
        self.assertEqual([o["reference"] for o in listed], [self.order.reference])

        res = self.client.post(f"/api/orders/{self.order.uid}/status/", json.dumps({"status": "paid"}),
                               content_type="application/json", **auth_header(self.admin))
        self.assertEqual(res.json()["order"]["status"], "paid")

        res = self.client.post(f"/api/orders/{self.order.uid}/status/", json.dumps({"status": "shipped-to-mars"}),
                               content_type="application/json", **auth_header(self.admin))
        self.assertEqual(res.status_code, 400)

    def test_staff_can_save_checkout_settings_with_normalized_number(self):
        res = self.client.post("/api/checkout-settings/", json.dumps({
            "whatsapp_number": "0803 123 4567", "bank_name": "GTBank",
            "account_number": "0123456789", "account_name": "SwissMax Beauty",
        }), content_type="application/json", **auth_header(self.admin))
        self.assertEqual(res.json()["settings"]["whatsapp_number"], "2348031234567")

        res = self.client.post("/api/checkout-settings/", json.dumps({"whatsapp_number": "12345"}),
                               content_type="application/json", **auth_header(self.admin))
        self.assertEqual(res.status_code, 400)


class NormalizeWhatsappNumberTests(TestCase):
    def test_formats(self):
        self.assertEqual(normalize_whatsapp_number("0803 123 4567"), "2348031234567")
        self.assertEqual(normalize_whatsapp_number("+234 803-123-4567"), "2348031234567")
        self.assertEqual(normalize_whatsapp_number("2348031234567"), "2348031234567")
        self.assertEqual(normalize_whatsapp_number(""), "")
