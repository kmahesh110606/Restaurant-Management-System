"""
DRF Serializers for the Restaurant Management Service.

Separated into read (nested) and write (flat FK) serializers where needed.
"""

from decimal import Decimal
from rest_framework import serializers
from django.contrib.auth.models import User

from restaurant.models import (
    phone_regex, Restaurant, Category, MenuItem, MenuTranslation, Recipe,
    Table, Token, Customer, Order, OrderItem, Bill, StaffProfile,
)


class TenantRelationsMixin:
    tenant_relations = {}

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get('request')
        # Standalone serializer use has no request; API serializers always have one.
        if request is not None:
            profile = getattr(request.user, 'staff_profile', None)
            for field_name, lookup in self.tenant_relations.items():
                field = fields[field_name]
                field.queryset = (field.queryset.filter(**{lookup: profile.restaurant_id})
                                  if profile and profile.is_active else field.queryset.none())
        return fields


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

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.logo:
            ret['logo'] = instance.logo.url
        if instance.menu_background:
            ret['menu_background'] = instance.menu_background.url
        return ret


class RestaurantPublicSerializer(serializers.ModelSerializer):
    """Minimal info exposed to unauthenticated customers."""

    class Meta:
        model = Restaurant
        fields = [
            'id', 'name', 'slug', 'description', 'logo', 'menu_background',
            'workflow_type', 'primary_color', 'secondary_color', 'accent_color',
            'font_family', 'default_language', 'currency', 'tax_rate',
        ]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.logo:
            ret['logo'] = instance.logo.url
        if instance.menu_background:
            ret['menu_background'] = instance.menu_background.url
        return ret


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
        read_only_fields = ['id', 'restaurant', 'created_at', 'updated_at']


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

class MenuTranslationSerializer(TenantRelationsMixin, serializers.ModelSerializer):
    tenant_relations = {'menu_item': 'category__restaurant_id'}
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


class MenuItemWriteSerializer(TenantRelationsMixin, serializers.ModelSerializer):
    tenant_relations = {'category': 'restaurant_id'}
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

class RecipeSerializer(TenantRelationsMixin, serializers.ModelSerializer):
    tenant_relations = {'menu_item': 'category__restaurant_id'}
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
        read_only_fields = ['id', 'restaurant', 'qr_code', 'created_at', 'updated_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.qr_code:
            ret['qr_code'] = instance.qr_code.url
        return ret


# ---------------------------------------------------------------------------
# Token
# ---------------------------------------------------------------------------

class TokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Token
        fields = ['id', 'restaurant', 'number', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'restaurant', 'number', 'created_at', 'updated_at']


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
        read_only_fields = ['id', 'restaurant', 'loyalty_points', 'created_at', 'updated_at']


# ---------------------------------------------------------------------------
# Order
# ---------------------------------------------------------------------------

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(read_only=True)
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
    quantity = serializers.IntegerField(min_value=1, max_value=100, default=1)
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


class PublicOrderSerializer(OrderSerializer):
    class Meta(OrderSerializer.Meta):
        fields = [field for field in OrderSerializer.Meta.fields
                  if field not in ('customer', 'customer_phone')]


class OrderCreateSerializer(serializers.Serializer):
    """
    Customer-facing order creation.  Accepts restaurant slug, table/token
    info, phone number, and a list of items.
    """
    restaurant_slug = serializers.SlugField()
    table_number = serializers.IntegerField(required=False, allow_null=True)
    phone_number = serializers.CharField(max_length=17)
    customer_name = serializers.CharField(max_length=200, required=False, default='', allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True, default='')
    items = OrderItemWriteSerializer(many=True)

    def validate_phone_number(self, value):
        import re
        value = re.sub(r'[\s()\-]', '', value)
        phone_regex(value)
        return value

    def validate_items(self, value):
        if not value or len(value) > 100:
            raise serializers.ValidationError("Provide between 1 and 100 items.")
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
    order_ids = serializers.ListField(child=serializers.UUIDField(), allow_empty=False, max_length=100)
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), min_value=Decimal('0.00'))
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
        read_only_fields = ['id', 'restaurant', 'created_at', 'updated_at']


class StaffCreateSerializer(serializers.Serializer):
    """Create a new staff member (User + StaffProfile)."""
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(min_length=8, write_only=True)
    first_name = serializers.CharField(max_length=150, required=False, default='', allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, default='', allow_blank=True)
    email = serializers.EmailField(required=False, default='', allow_blank=True)
    role = serializers.ChoiceField(choices=StaffProfile.ROLE_CHOICES)
    phone_number = serializers.CharField(max_length=17, required=False, default='', allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value


class LoginSerializer(serializers.Serializer):
    """Staff login — returns JWT tokens."""
    username = serializers.CharField()
    password = serializers.CharField()


class GoogleLoginSerializer(serializers.Serializer):
    """Owner-only Google OAuth login — accepts Google ID token."""
    id_token = serializers.CharField()


class RestaurantSignupSerializer(serializers.Serializer):
    """
    New restaurant owner registration.
    Creates User + Restaurant + StaffProfile (admin role) in one step.
    """
    # Owner account fields
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(min_length=8, write_only=True)
    first_name = serializers.CharField(max_length=150, required=False, default='', allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, default='', allow_blank=True)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=17, required=False, default='', allow_blank=True)

    # Restaurant fields
    restaurant_name = serializers.CharField(max_length=200)
    restaurant_slug = serializers.SlugField(max_length=100)
    restaurant_description = serializers.CharField(required=False, default='', allow_blank=True)
    restaurant_address = serializers.CharField(required=False, default='', allow_blank=True)
    restaurant_phone = serializers.CharField(max_length=20, required=False, default='', allow_blank=True)
    workflow_type = serializers.ChoiceField(choices=Restaurant.WORKFLOW_CHOICES, default='table')

    # Theming (optional)
    primary_color = serializers.CharField(max_length=7, default='#E53935')
    secondary_color = serializers.CharField(max_length=7, default='#1a1a1a')
    accent_color = serializers.CharField(max_length=7, default='#FFB300')
    font_family = serializers.CharField(max_length=100, default='Inter')
    currency = serializers.CharField(max_length=5, required=False, default='INR')

    # Optional: Google ID token (for Google-based signup)
    google_id_token = serializers.CharField(required=False, allow_blank=True, default='')

    def to_internal_value(self, data):
        # Support both flat payloads and nested { user: {...}, restaurant: {...} } payloads
        if isinstance(data, dict) and ('user' in data or 'restaurant' in data):
            flattened = {}
            user_data = data.get('user')
            if isinstance(user_data, dict):
                flattened.update(user_data)
            resto_data = data.get('restaurant')
            if isinstance(resto_data, dict):
                for k, v in resto_data.items():
                    if k == 'name':
                        flattened.setdefault('restaurant_name', v)
                    elif k == 'slug':
                        flattened.setdefault('restaurant_slug', v)
                    elif k == 'description':
                        flattened.setdefault('restaurant_description', v)
                    elif k == 'address':
                        flattened.setdefault('restaurant_address', v)
                    elif k == 'phone':
                        flattened.setdefault('restaurant_phone', v)
                    else:
                        flattened.setdefault(k, v)
            for k, v in data.items():
                if k not in ('user', 'restaurant'):
                    flattened.setdefault(k, v)
            data = flattened
        return super().to_internal_value(data)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_restaurant_slug(self, value):
        if Restaurant.objects.filter(slug=value).exists():
            raise serializers.ValidationError("This restaurant slug is already taken.")
        return value
