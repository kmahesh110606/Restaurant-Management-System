"""
DRF Serializers for the Restaurant Management System.

Separated into read (nested) and write (flat FK) serializers where needed.
"""

from rest_framework import serializers
from django.contrib.auth.models import User

from restaurant.models import (
    Restaurant, Category, MenuItem, MenuTranslation, Recipe,
    Table, Token, Customer, Order, OrderItem, Bill, StaffProfile,
)


# ---------------------------------------------------------------------------
# Restaurant
# ---------------------------------------------------------------------------

class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = [
            'id', 'name', 'slug', 'description', 'logo', 'menu_background',
            'address', 'phone', 'workflow_type',
            'primary_color', 'secondary_color', 'accent_color', 'font_family',
            'default_language', 'tax_rate', 'currency',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RestaurantPublicSerializer(serializers.ModelSerializer):
    """Minimal info exposed to unauthenticated customers."""

    class Meta:
        model = Restaurant
        fields = [
            'id', 'name', 'slug', 'description', 'logo', 'menu_background',
            'workflow_type', 'primary_color', 'secondary_color', 'accent_color',
            'font_family', 'default_language', 'currency',
        ]


# ---------------------------------------------------------------------------
# Category
# ---------------------------------------------------------------------------

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id', 'restaurant', 'name', 'description',
            'display_order', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CategoryListSerializer(serializers.ModelSerializer):
    """Category with nested menu items for the customer view."""
    items = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'display_order', 'items']

    def get_items(self, obj):
        available_items = obj.items.filter(is_available=True)
        return MenuItemSerializer(available_items, many=True, context=self.context).data


# ---------------------------------------------------------------------------
# MenuItem
# ---------------------------------------------------------------------------

class MenuTranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuTranslation
        fields = ['id', 'menu_item', 'language_code', 'translated_name', 'translated_description']
        read_only_fields = ['id']


class MenuItemSerializer(serializers.ModelSerializer):
    translations = MenuTranslationSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            'id', 'category', 'category_name', 'name', 'description', 'price',
            'image', 'is_available', 'is_vegetarian', 'is_vegan',
            'spice_level', 'preparation_time', 'translations',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MenuItemWriteSerializer(serializers.ModelSerializer):
    """For creating/updating menu items (no nested translations)."""

    class Meta:
        model = MenuItem
        fields = [
            'id', 'category', 'name', 'description', 'price',
            'image', 'is_available', 'is_vegetarian', 'is_vegan',
            'spice_level', 'preparation_time',
        ]
        read_only_fields = ['id']


# ---------------------------------------------------------------------------
# Recipe
# ---------------------------------------------------------------------------

class RecipeSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)

    class Meta:
        model = Recipe
        fields = [
            'id', 'menu_item', 'menu_item_name', 'ingredients', 'instructions',
            'prep_time_minutes', 'cook_time_minutes', 'serves', 'notes',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ---------------------------------------------------------------------------
# Table
# ---------------------------------------------------------------------------

class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = [
            'id', 'restaurant', 'number', 'name', 'capacity',
            'qr_code', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'qr_code', 'created_at', 'updated_at']


# ---------------------------------------------------------------------------
# Token
# ---------------------------------------------------------------------------

class TokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Token
        fields = ['id', 'restaurant', 'number', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'number', 'created_at', 'updated_at']


# ---------------------------------------------------------------------------
# Customer
# ---------------------------------------------------------------------------

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id', 'restaurant', 'phone_number', 'name',
            'loyalty_points', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'loyalty_points', 'created_at', 'updated_at']


# ---------------------------------------------------------------------------
# Order
# ---------------------------------------------------------------------------

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_image = serializers.ImageField(source='menu_item.image', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'order', 'menu_item', 'menu_item_name', 'menu_item_image',
            'quantity', 'unit_price', 'subtotal', 'notes', 'created_at',
        ]
        read_only_fields = ['id', 'subtotal', 'created_at']


class OrderItemWriteSerializer(serializers.Serializer):
    """Used inside OrderCreateSerializer for nested order item creation."""
    menu_item = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    table_number = serializers.IntegerField(source='table.number', read_only=True, allow_null=True)
    token_number = serializers.IntegerField(source='token.number', read_only=True, allow_null=True)
    customer_phone = serializers.CharField(source='customer.phone_number', read_only=True, allow_null=True)

    class Meta:
        model = Order
        fields = [
            'id', 'restaurant', 'order_type', 'table', 'table_number',
            'token', 'token_number', 'customer', 'customer_phone',
            'status', 'total_amount', 'notes',
            'items', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'total_amount', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.Serializer):
    """
    Customer-facing order creation.  Accepts restaurant slug, table/token
    info, phone number, and a list of items.
    """
    restaurant_slug = serializers.SlugField()
    table_number = serializers.IntegerField(required=False, allow_null=True)
    phone_number = serializers.CharField(max_length=17)
    customer_name = serializers.CharField(max_length=200, required=False, default='')
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    items = OrderItemWriteSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one item is required.")
        return value


class OrderStatusUpdateSerializer(serializers.Serializer):
    """For staff to update order status."""
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)


# ---------------------------------------------------------------------------
# Bill
# ---------------------------------------------------------------------------

class BillSerializer(serializers.ModelSerializer):
    orders = OrderSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Bill
        fields = [
            'id', 'restaurant', 'orders', 'customer',
            'subtotal', 'tax_amount', 'discount_amount', 'final_amount',
            'payment_status', 'payment_method', 'created_by', 'created_by_name',
            'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'subtotal', 'tax_amount', 'final_amount',
            'created_at', 'updated_at',
        ]


class BillCreateSerializer(serializers.Serializer):
    """Create a bill from order IDs."""
    order_ids = serializers.ListField(child=serializers.UUIDField())
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class BillPaymentSerializer(serializers.Serializer):
    """Mark a bill as paid."""
    payment_status = serializers.ChoiceField(choices=Bill.PAYMENT_STATUS_CHOICES)
    payment_method = serializers.ChoiceField(choices=Bill.PAYMENT_METHOD_CHOICES, required=False)


# ---------------------------------------------------------------------------
# Staff / User
# ---------------------------------------------------------------------------

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        read_only_fields = ['id']


class StaffProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = StaffProfile
        fields = [
            'id', 'user', 'restaurant', 'role', 'phone_number',
            'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class StaffCreateSerializer(serializers.Serializer):
    """Create a new staff member (User + StaffProfile)."""
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(min_length=8, write_only=True)
    first_name = serializers.CharField(max_length=150, required=False, default='')
    last_name = serializers.CharField(max_length=150, required=False, default='')
    email = serializers.EmailField(required=False, default='')
    role = serializers.ChoiceField(choices=StaffProfile.ROLE_CHOICES)
    phone_number = serializers.CharField(max_length=17, required=False, default='')

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value


class LoginSerializer(serializers.Serializer):
    """Staff login — returns JWT tokens."""
    username = serializers.CharField()
    password = serializers.CharField()
