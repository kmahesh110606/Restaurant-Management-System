"""
Restaurant Management System — Models

Multi-tenant architecture: every model is scoped to a Restaurant via FK.
Data isolation is enforced at the queryset level in views.
"""

import uuid
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, RegexValidator


# ---------------------------------------------------------------------------
# Restaurant (tenant)
# ---------------------------------------------------------------------------

class Restaurant(models.Model):
    """
    Top-level tenant model. Each restaurant is an isolated data silo.
    Includes configuration / theming fields so there is no separate config table.
    """

    WORKFLOW_CHOICES = [
        ('table', 'Table-based ordering'),
        ('token', 'Token-based ordering'),
        ('shop', 'Shop / Biller workflow'),
    ]

    # Identity
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=100, unique=True, help_text="URL-safe identifier, e.g. 'pizza-palace'")
    description = models.TextField(blank=True, default='')
    logo = models.ImageField(upload_to='restaurants/logos/', blank=True, null=True)
    menu_background = models.ImageField(upload_to='restaurants/backgrounds/', blank=True, null=True)
    address = models.TextField(blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')

    # Workflow
    workflow_type = models.CharField(max_length=10, choices=WORKFLOW_CHOICES, default='table')

    # Theming
    primary_color = models.CharField(max_length=7, default='#6366f1', help_text='Hex color')
    secondary_color = models.CharField(max_length=7, default='#1e1b4b', help_text='Hex color')
    accent_color = models.CharField(max_length=7, default='#f59e0b', help_text='Hex color')
    font_family = models.CharField(max_length=100, default='Inter', help_text='Google Fonts family name')

    # Locale / Business
    default_language = models.CharField(max_length=10, default='en')
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, help_text='Tax percentage')
    currency = models.CharField(max_length=5, default='INR')

    # Owner
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_restaurants')

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# Menu
# ---------------------------------------------------------------------------

class Category(models.Model):
    """Menu category (e.g. Starters, Mains, Desserts)."""

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'name']
        verbose_name_plural = 'categories'
        unique_together = ['restaurant', 'name']

    def __str__(self):
        return f"{self.name} ({self.restaurant.name})"


class MenuItem(models.Model):
    """A single dish / beverage on the menu."""

    SPICE_LEVELS = [
        (0, 'None'),
        (1, 'Mild'),
        (2, 'Medium'),
        (3, 'Hot'),
        (4, 'Extra Hot'),
    ]

    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    image = models.ImageField(upload_to='menu_items/', blank=True, null=True)
    is_available = models.BooleanField(default=True)
    is_vegetarian = models.BooleanField(default=False)
    is_vegan = models.BooleanField(default=False)
    spice_level = models.IntegerField(choices=SPICE_LEVELS, default=0)
    preparation_time = models.PositiveIntegerField(default=15, help_text='Estimated minutes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category__display_order', 'name']

    def __str__(self):
        return f"{self.name} — ₹{self.price}"

    @property
    def restaurant(self):
        return self.category.restaurant


class MenuTranslation(models.Model):
    """Translated name/description for a menu item."""

    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='translations')
    language_code = models.CharField(max_length=10, help_text='e.g. hi, ta, es')
    translated_name = models.CharField(max_length=200)
    translated_description = models.TextField(blank=True, default='')

    class Meta:
        unique_together = ['menu_item', 'language_code']

    def __str__(self):
        return f"{self.menu_item.name} [{self.language_code}]"


class Recipe(models.Model):
    """Internal recipe reference. Never exposed to customers."""

    menu_item = models.OneToOneField(MenuItem, on_delete=models.CASCADE, related_name='recipe')
    ingredients = models.TextField(help_text='List of ingredients')
    instructions = models.TextField(help_text='Step-by-step cooking instructions')
    prep_time_minutes = models.PositiveIntegerField(default=0)
    cook_time_minutes = models.PositiveIntegerField(default=0)
    serves = models.PositiveIntegerField(default=1)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Recipe: {self.menu_item.name}"


# ---------------------------------------------------------------------------
# Tables & Tokens
# ---------------------------------------------------------------------------

class Table(models.Model):
    """Physical table in the restaurant (for table-based workflow)."""

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='tables')
    number = models.PositiveIntegerField()
    name = models.CharField(max_length=100, blank=True, default='', help_text='Optional label, e.g. "Window Seat #3"')
    capacity = models.PositiveIntegerField(default=4)
    qr_code = models.ImageField(upload_to='qr_codes/tables/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['number']
        unique_together = ['restaurant', 'number']

    def __str__(self):
        label = self.name or f"Table {self.number}"
        return f"{label} ({self.restaurant.name})"


class Token(models.Model):
    """
    Token for token-based ordering workflow.
    Token numbers reset daily per restaurant.
    """

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='tokens')
    number = models.PositiveIntegerField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Token #{self.number} ({self.restaurant.name})"


# ---------------------------------------------------------------------------
# Customer
# ---------------------------------------------------------------------------

phone_regex = RegexValidator(
    regex=r'^\+?1?\d{9,15}$',
    message="Phone number must be 9-15 digits. Optionally prefixed with '+'."
)


class Customer(models.Model):
    """
    Lightweight customer record identified by phone number.
    Scoped per restaurant for loyalty tracking.
    """

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='customers')
    phone_number = models.CharField(max_length=17, validators=[phone_regex])
    name = models.CharField(max_length=200, blank=True, default='')
    loyalty_points = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['restaurant', 'phone_number']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.phone_number} — {self.name or 'Guest'}"


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------

class Order(models.Model):
    """
    Central order entity. Mapped to a table, token, or neither (shop mode).
    A customer can place multiple orders on the same table until the biller
    marks the session as paid.
    """

    ORDER_TYPE_CHOICES = [
        ('table', 'Table'),
        ('token', 'Token'),
        ('shop', 'Shop'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('served', 'Served'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='orders')
    order_type = models.CharField(max_length=10, choices=ORDER_TYPE_CHOICES)
    table = models.ForeignKey(Table, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    token = models.ForeignKey(Token, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {str(self.id)[:8]} — {self.get_status_display()}"

    def recalculate_total(self):
        """Recalculate total from order items."""
        self.total_amount = sum(item.subtotal for item in self.items.all())
        self.save(update_fields=['total_amount'])


class OrderItem(models.Model):
    """Line item within an order."""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='order_items')
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name}"

    def save(self, *args, **kwargs):
        """Auto-compute subtotal on save."""
        self.subtotal = self.unit_price * self.quantity
        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# Billing
# ---------------------------------------------------------------------------

class Bill(models.Model):
    """Invoice linked to one or more orders (via table/token session)."""

    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('partial', 'Partial'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('upi', 'UPI'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='bills')
    orders = models.ManyToManyField(Order, related_name='bills')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='bills')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, default='cash')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_bills')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Bill {str(self.id)[:8]} — ₹{self.final_amount}"

    def recalculate(self):
        """Recalculate bill totals from linked orders."""
        from decimal import Decimal as D
        self.subtotal = sum(order.total_amount for order in self.orders.all())
        tax_rate = D(str(self.restaurant.tax_rate))
        self.tax_amount = self.subtotal * (tax_rate / D('100'))
        self.final_amount = self.subtotal + self.tax_amount - self.discount_amount
        self.save(update_fields=['subtotal', 'tax_amount', 'final_amount'])


# ---------------------------------------------------------------------------
# Staff
# ---------------------------------------------------------------------------

class StaffProfile(models.Model):
    """
    Extends Django User with a role and restaurant assignment.
    One user belongs to exactly one restaurant.
    """

    ROLE_CHOICES = [
        ('admin', 'Admin / Owner'),
        ('waiter', 'Waiter'),
        ('kitchen', 'Kitchen Staff'),
        ('biller', 'Biller / Cashier'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='staff')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='waiter')
    phone_number = models.CharField(max_length=17, blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['user__username']

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} — {self.get_role_display()}"
