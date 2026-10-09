import re
import secrets

from django.db import models
from base.models import BaseModel
from products.models import Product


# Unambiguous characters only (no 0/O or 1/I) so references are easy to read out over the phone
REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def generate_order_reference():
    return "SMX-" + "".join(secrets.choice(REFERENCE_ALPHABET) for _ in range(6))


def normalize_whatsapp_number(raw):
    """Return digits in international format for wa.me links, e.g. '0803 123 4567' -> '2348031234567'."""
    digits = re.sub(r"\D", "", raw or "")
    if len(digits) == 11 and digits.startswith("0"):
        # Nigerian local format
        digits = "234" + digits[1:]
    return digits


class Order(BaseModel):
    STATUS_CHOICES = [
        ("new", "New"),
        ("paid", "Paid"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    ]

    reference = models.CharField(max_length=20, unique=True, default=generate_order_reference)
    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=40)
    delivery_address = models.TextField()
    note = models.TextField(blank=True)
    # In NGN, computed server-side from current product prices
    total = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")

    class Meta:
        ordering = ["-create_at"]

    def __str__(self):
        return f"{self.reference} ({self.customer_name})"


class OrderItem(BaseModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    # Name and price are copied so the order stays accurate if the product is later edited or deleted
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    product_name = models.CharField(max_length=255)
    unit_price = models.PositiveIntegerField()
    quantity = models.PositiveIntegerField()

    @property
    def line_total(self):
        return self.unit_price * self.quantity


class CheckoutSettings(BaseModel):
    """Single row holding the details shown to customers after they place an order."""
    whatsapp_number = models.CharField(max_length=20, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    account_number = models.CharField(max_length=20, blank=True)
    account_name = models.CharField(max_length=200, blank=True)

    @classmethod
    def load(cls):
        return cls.objects.first() or cls.objects.create()

    def __str__(self):
        return "Checkout settings"
