"""
Comprehensive Test Suite for the Restaurant Management System (RMS).

Covers:
  - Models (creation, relationships, constraints, methods)
  - Serializers (validation, data transformation)
  - Permissions (role-based access control)
  - Utilities (QR code generation, token numbering)
  - API Endpoints (auth, CRUD, workflows, analytics)

Run with:
    python manage.py test restaurant -v 2
"""

import uuid
from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from restaurant.models import (
    Restaurant, Category, MenuItem, MenuTranslation, Recipe,
    Table, Token, Customer, Order, OrderItem, Bill, StaffProfile,
)
from restaurant.serializers import (
    RestaurantSerializer, RestaurantPublicSerializer,
    CategorySerializer, MenuItemSerializer, MenuItemWriteSerializer,
    TableSerializer, TokenSerializer, CustomerSerializer,
    OrderSerializer, OrderCreateSerializer, OrderStatusUpdateSerializer,
    BillSerializer, BillCreateSerializer, BillPaymentSerializer,
    StaffProfileSerializer, StaffCreateSerializer,
    LoginSerializer, RestaurantSignupSerializer,
)
from restaurant.permissions import (
    IsAdmin, IsStaff, IsAdminOrReadOnly, IsAdminOrKitchen, IsBillerOrAdmin,
)
from restaurant.utils import generate_qr_code, get_next_token_number


# ===========================================================================
# Helper: Create test data
# ===========================================================================

class TestDataMixin:
    """Mixin to create reusable test data across test cases."""

    def create_user(self, username='testuser', password='testpass123', **kwargs):
        return User.objects.create_user(username=username, password=password, **kwargs)

    def create_restaurant(self, owner=None, **kwargs):
        if owner is None:
            owner = self.create_user(username=f'owner_{uuid.uuid4().hex[:8]}')
        defaults = {
            'name': 'Test Restaurant',
            'slug': f'test-restaurant-{uuid.uuid4().hex[:8]}',
            'description': 'A test restaurant',
            'workflow_type': 'table',
            'owner': owner,
        }
        defaults.update(kwargs)
        return Restaurant.objects.create(**defaults)

    def create_staff_profile(self, user=None, restaurant=None, role='waiter'):
        if user is None:
            user = self.create_user(username=f'staff_{uuid.uuid4().hex[:8]}')
        if restaurant is None:
            restaurant = self.create_restaurant()
        return StaffProfile.objects.create(
            user=user, restaurant=restaurant, role=role
        )

    def create_category(self, restaurant=None, **kwargs):
        if restaurant is None:
            restaurant = self.create_restaurant()
        defaults = {'name': 'Starters', 'display_order': 0}
        defaults.update(kwargs)
        return Category.objects.create(restaurant=restaurant, **defaults)

    def create_menu_item(self, category=None, **kwargs):
        if category is None:
            category = self.create_category()
        defaults = {
            'name': 'Test Item',
            'price': Decimal('9.99'),
            'is_available': True,
        }
        defaults.update(kwargs)
        return MenuItem.objects.create(category=category, **defaults)

    def create_table(self, restaurant=None, **kwargs):
        if restaurant is None:
            restaurant = self.create_restaurant()
        defaults = {'number': 1, 'capacity': 4}
        defaults.update(kwargs)
        return Table.objects.create(restaurant=restaurant, **defaults)

    def create_customer(self, restaurant=None, **kwargs):
        if restaurant is None:
            restaurant = self.create_restaurant()
        defaults = {'phone_number': '+911234567890', 'name': 'Test Customer'}
        defaults.update(kwargs)
        return Customer.objects.create(restaurant=restaurant, **defaults)

    def create_order(self, restaurant=None, **kwargs):
        if restaurant is None:
            restaurant = self.create_restaurant()
        defaults = {
            'order_type': 'table',
            'status': 'pending',
            'total_amount': Decimal('0.00'),
        }
        defaults.update(kwargs)
        return Order.objects.create(restaurant=restaurant, **defaults)

    def setup_full_restaurant(self):
        """Create a complete restaurant setup with admin, staff, menu, and table."""
        owner = self.create_user(username='admin_user', password='adminpass123',
                                  email='admin@test.com')
        restaurant = self.create_restaurant(owner=owner, slug='test-resto')
        admin_profile = self.create_staff_profile(
            user=owner, restaurant=restaurant, role='admin'
        )

        waiter_user = self.create_user(username='waiter_user', password='waiterpass123')
        waiter_profile = self.create_staff_profile(
            user=waiter_user, restaurant=restaurant, role='waiter'
        )

        kitchen_user = self.create_user(username='kitchen_user', password='kitchenpass123')
        kitchen_profile = self.create_staff_profile(
            user=kitchen_user, restaurant=restaurant, role='kitchen'
        )

        biller_user = self.create_user(username='biller_user', password='billerpass123')
        biller_profile = self.create_staff_profile(
            user=biller_user, restaurant=restaurant, role='biller'
        )

        category = self.create_category(restaurant=restaurant, name='Mains')
        item1 = self.create_menu_item(category=category, name='Burger', price=Decimal('12.99'))
        item2 = self.create_menu_item(category=category, name='Pasta', price=Decimal('15.50'))

        table = self.create_table(restaurant=restaurant, number=1)
        customer = self.create_customer(restaurant=restaurant)

        return {
            'restaurant': restaurant,
            'admin_user': owner,
            'admin_profile': admin_profile,
            'waiter_user': waiter_user,
            'waiter_profile': waiter_profile,
            'kitchen_user': kitchen_user,
            'kitchen_profile': kitchen_profile,
            'biller_user': biller_user,
            'biller_profile': biller_profile,
            'category': category,
            'item1': item1,
            'item2': item2,
            'table': table,
            'customer': customer,
        }


# ===========================================================================
# Model Tests
# ===========================================================================

class RestaurantModelTest(TestCase, TestDataMixin):
    """Tests for the Restaurant model."""

    def test_create_restaurant(self):
        owner = self.create_user()
        restaurant = self.create_restaurant(owner=owner, name='My Bistro', slug='my-bistro')
        self.assertEqual(restaurant.name, 'My Bistro')
        self.assertEqual(restaurant.slug, 'my-bistro')
        self.assertEqual(restaurant.owner, owner)
        self.assertTrue(restaurant.is_active)

    def test_default_values(self):
        restaurant = self.create_restaurant()
        self.assertEqual(restaurant.workflow_type, 'table')
        self.assertEqual(restaurant.primary_color, '#6366f1')
        self.assertEqual(restaurant.currency, 'INR')
        self.assertEqual(restaurant.tax_rate, Decimal('0.00'))
        self.assertEqual(restaurant.font_family, 'Inter')

    def test_str_representation(self):
        restaurant = self.create_restaurant(name='Grand Bistro')
        self.assertEqual(str(restaurant), 'Grand Bistro')

    def test_unique_slug(self):
        owner = self.create_user()
        self.create_restaurant(owner=owner, slug='unique-slug')
        with self.assertRaises(Exception):
            self.create_restaurant(owner=owner, slug='unique-slug')

    def test_uuid_primary_key(self):
        restaurant = self.create_restaurant()
        self.assertIsInstance(restaurant.id, uuid.UUID)


class CategoryModelTest(TestCase, TestDataMixin):
    """Tests for the Category model."""

    def test_create_category(self):
        restaurant = self.create_restaurant()
        category = self.create_category(restaurant=restaurant, name='Appetizers')
        self.assertEqual(category.name, 'Appetizers')
        self.assertEqual(category.restaurant, restaurant)

    def test_str_representation(self):
        restaurant = self.create_restaurant(name='My Place')
        category = self.create_category(restaurant=restaurant, name='Desserts')
        self.assertEqual(str(category), 'Desserts (My Place)')

    def test_unique_together(self):
        restaurant = self.create_restaurant()
        self.create_category(restaurant=restaurant, name='Starters')
        with self.assertRaises(Exception):
            self.create_category(restaurant=restaurant, name='Starters')

    def test_ordering(self):
        restaurant = self.create_restaurant()
        cat_b = self.create_category(restaurant=restaurant, name='Beverages', display_order=2)
        cat_a = self.create_category(restaurant=restaurant, name='Appetizers', display_order=1)
        categories = list(Category.objects.filter(restaurant=restaurant))
        self.assertEqual(categories[0], cat_a)
        self.assertEqual(categories[1], cat_b)


class MenuItemModelTest(TestCase, TestDataMixin):
    """Tests for the MenuItem model."""

    def test_create_menu_item(self):
        item = self.create_menu_item(name='Pizza', price=Decimal('14.99'))
        self.assertEqual(item.name, 'Pizza')
        self.assertEqual(item.price, Decimal('14.99'))
        self.assertTrue(item.is_available)

    def test_str_representation(self):
        item = self.create_menu_item(name='Burger', price=Decimal('10.00'))
        self.assertIn('Burger', str(item))
        self.assertIn('10.00', str(item))

    def test_restaurant_property(self):
        restaurant = self.create_restaurant()
        category = self.create_category(restaurant=restaurant)
        item = self.create_menu_item(category=category)
        self.assertEqual(item.restaurant, restaurant)

    def test_default_values(self):
        item = self.create_menu_item()
        self.assertFalse(item.is_vegetarian)
        self.assertFalse(item.is_vegan)
        self.assertEqual(item.spice_level, 0)
        self.assertEqual(item.preparation_time, 15)


class TableModelTest(TestCase, TestDataMixin):
    """Tests for the Table model."""

    def test_create_table(self):
        restaurant = self.create_restaurant()
        table = self.create_table(restaurant=restaurant, number=5, capacity=6)
        self.assertEqual(table.number, 5)
        self.assertEqual(table.capacity, 6)

    def test_str_with_name(self):
        restaurant = self.create_restaurant(name='Café')
        table = self.create_table(restaurant=restaurant, name='Window Seat')
        self.assertIn('Window Seat', str(table))

    def test_str_without_name(self):
        restaurant = self.create_restaurant(name='Café')
        table = self.create_table(restaurant=restaurant, number=3)
        self.assertIn('Table 3', str(table))

    def test_unique_together(self):
        restaurant = self.create_restaurant()
        self.create_table(restaurant=restaurant, number=1)
        with self.assertRaises(Exception):
            self.create_table(restaurant=restaurant, number=1)


class TokenModelTest(TestCase, TestDataMixin):
    """Tests for the Token model."""

    def test_create_token(self):
        restaurant = self.create_restaurant()
        token = Token.objects.create(restaurant=restaurant, number=1)
        self.assertEqual(token.number, 1)
        self.assertEqual(token.status, 'active')

    def test_str_representation(self):
        restaurant = self.create_restaurant(name='Diner')
        token = Token.objects.create(restaurant=restaurant, number=42)
        self.assertEqual(str(token), 'Token #42 (Diner)')


class CustomerModelTest(TestCase, TestDataMixin):
    """Tests for the Customer model."""

    def test_create_customer(self):
        customer = self.create_customer(name='John Doe')
        self.assertEqual(customer.name, 'John Doe')
        self.assertEqual(customer.loyalty_points, 0)

    def test_str_representation(self):
        customer = self.create_customer(phone_number='+919876543210', name='Jane')
        self.assertIn('+919876543210', str(customer))
        self.assertIn('Jane', str(customer))

    def test_unique_together(self):
        restaurant = self.create_restaurant()
        self.create_customer(restaurant=restaurant, phone_number='+919876543210')
        with self.assertRaises(Exception):
            self.create_customer(restaurant=restaurant, phone_number='+919876543210')


class OrderModelTest(TestCase, TestDataMixin):
    """Tests for the Order and OrderItem models."""

    def test_create_order(self):
        order = self.create_order()
        self.assertEqual(order.status, 'pending')
        self.assertIsInstance(order.id, uuid.UUID)

    def test_str_representation(self):
        order = self.create_order()
        self.assertIn('Pending', str(order))

    def test_order_item_subtotal(self):
        order = self.create_order()
        item = self.create_menu_item(price=Decimal('10.00'))
        order_item = OrderItem.objects.create(
            order=order, menu_item=item,
            quantity=3, unit_price=Decimal('10.00'),
        )
        self.assertEqual(order_item.subtotal, Decimal('30.00'))

    def test_recalculate_total(self):
        restaurant = self.create_restaurant()
        category = self.create_category(restaurant=restaurant)
        item = self.create_menu_item(category=category, price=Decimal('10.00'))
        order = self.create_order(restaurant=restaurant)
        OrderItem.objects.create(
            order=order, menu_item=item,
            quantity=2, unit_price=Decimal('10.00'),
        )
        OrderItem.objects.create(
            order=order, menu_item=item,
            quantity=1, unit_price=Decimal('10.00'),
        )
        order.recalculate_total()
        self.assertEqual(order.total_amount, Decimal('30.00'))


class BillModelTest(TestCase, TestDataMixin):
    """Tests for the Bill model."""

    def test_create_bill(self):
        restaurant = self.create_restaurant()
        bill = Bill.objects.create(restaurant=restaurant)
        self.assertEqual(bill.payment_status, 'unpaid')
        self.assertEqual(bill.payment_method, 'cash')

    def test_str_representation(self):
        restaurant = self.create_restaurant()
        bill = Bill.objects.create(restaurant=restaurant, final_amount=Decimal('500.00'))
        self.assertIn('500.00', str(bill))

    def test_recalculate(self):
        restaurant = self.create_restaurant(tax_rate=Decimal('10.00'))
        category = self.create_category(restaurant=restaurant)
        item = self.create_menu_item(category=category, price=Decimal('100.00'))

        order = self.create_order(restaurant=restaurant, total_amount=Decimal('100.00'))
        OrderItem.objects.create(
            order=order, menu_item=item,
            quantity=1, unit_price=Decimal('100.00'),
        )

        bill = Bill.objects.create(restaurant=restaurant, discount_amount=Decimal('10.00'))
        bill.orders.add(order)
        bill.recalculate()

        self.assertEqual(bill.subtotal, Decimal('100.00'))
        self.assertEqual(bill.tax_amount, Decimal('10.00'))
        self.assertEqual(bill.final_amount, Decimal('100.00'))  # 100 + 10 - 10


class StaffProfileModelTest(TestCase, TestDataMixin):
    """Tests for the StaffProfile model."""

    def test_create_profile(self):
        profile = self.create_staff_profile(role='kitchen')
        self.assertEqual(profile.role, 'kitchen')
        self.assertTrue(profile.is_active)

    def test_str_representation(self):
        user = self.create_user(username='chef123')
        profile = self.create_staff_profile(user=user, role='kitchen')
        self.assertIn('Kitchen Staff', str(profile))


class RecipeModelTest(TestCase, TestDataMixin):
    """Tests for the Recipe model."""

    def test_create_recipe(self):
        item = self.create_menu_item(name='Grilled Chicken')
        recipe = Recipe.objects.create(
            menu_item=item,
            ingredients='Chicken, Spices, Oil',
            instructions='Marinate, then grill.',
            prep_time_minutes=15,
            cook_time_minutes=20,
            serves=2,
        )
        self.assertEqual(str(recipe), 'Recipe: Grilled Chicken')
        self.assertEqual(recipe.serves, 2)


class MenuTranslationModelTest(TestCase, TestDataMixin):
    """Tests for the MenuTranslation model."""

    def test_create_translation(self):
        item = self.create_menu_item(name='Burger')
        translation = MenuTranslation.objects.create(
            menu_item=item,
            language_code='hi',
            translated_name='बर्गर',
            translated_description='',
        )
        self.assertEqual(str(translation), 'Burger [hi]')

    def test_unique_together(self):
        item = self.create_menu_item()
        MenuTranslation.objects.create(
            menu_item=item, language_code='es',
            translated_name='Hamburguesa',
        )
        with self.assertRaises(Exception):
            MenuTranslation.objects.create(
                menu_item=item, language_code='es',
                translated_name='Otro Nombre',
            )


# ===========================================================================
# Utility Tests
# ===========================================================================

class UtilityTest(TestCase, TestDataMixin):
    """Tests for utility functions."""

    def test_generate_qr_code(self):
        content_file = generate_qr_code('https://example.com/menu', filename_prefix='test')
        self.assertTrue(content_file.name.startswith('test_'))
        self.assertTrue(content_file.name.endswith('.png'))
        self.assertGreater(len(content_file.read()), 0)

    def test_get_next_token_number_first(self):
        restaurant = self.create_restaurant()
        next_num = get_next_token_number(restaurant)
        self.assertEqual(next_num, 1)

    def test_get_next_token_number_increments(self):
        restaurant = self.create_restaurant()
        Token.objects.create(restaurant=restaurant, number=1)
        Token.objects.create(restaurant=restaurant, number=2)
        next_num = get_next_token_number(restaurant)
        self.assertEqual(next_num, 3)


# ===========================================================================
# Serializer Tests
# ===========================================================================

class SerializerTests(TestCase, TestDataMixin):
    """Tests for DRF serializers."""

    def test_restaurant_serializer_fields(self):
        restaurant = self.create_restaurant()
        serializer = RestaurantSerializer(restaurant)
        data = serializer.data
        self.assertIn('id', data)
        self.assertIn('name', data)
        self.assertIn('slug', data)
        self.assertIn('workflow_type', data)
        self.assertIn('primary_color', data)

    def test_restaurant_public_serializer_excludes_sensitive(self):
        restaurant = self.create_restaurant()
        serializer = RestaurantPublicSerializer(restaurant)
        data = serializer.data
        # Public serializer should not include address, phone, etc.
        self.assertNotIn('address', data)
        self.assertNotIn('phone', data)
        self.assertNotIn('tax_rate', data)

    def test_login_serializer_valid(self):
        serializer = LoginSerializer(data={'username': 'test', 'password': 'pass123'})
        self.assertTrue(serializer.is_valid())

    def test_login_serializer_missing_fields(self):
        serializer = LoginSerializer(data={'username': 'test'})
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)

    def test_staff_create_serializer_duplicate_username(self):
        self.create_user(username='existing')
        serializer = StaffCreateSerializer(data={
            'username': 'existing',
            'password': 'password123',
            'role': 'waiter',
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)

    def test_order_create_serializer_empty_items(self):
        serializer = OrderCreateSerializer(data={
            'restaurant_slug': 'test',
            'phone_number': '+911234567890',
            'items': [],
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('items', serializer.errors)

    def test_order_status_update_serializer(self):
        serializer = OrderStatusUpdateSerializer(data={'status': 'preparing'})
        self.assertTrue(serializer.is_valid())

    def test_order_status_update_invalid(self):
        serializer = OrderStatusUpdateSerializer(data={'status': 'flying'})
        self.assertFalse(serializer.is_valid())

    def test_bill_payment_serializer_valid(self):
        serializer = BillPaymentSerializer(data={
            'payment_status': 'paid',
            'payment_method': 'upi',
        })
        self.assertTrue(serializer.is_valid())

    def test_signup_serializer_duplicate_email(self):
        self.create_user(username='user1', email='taken@test.com')
        serializer = RestaurantSignupSerializer(data={
            'username': 'newuser',
            'password': 'password123',
            'email': 'taken@test.com',
            'restaurant_name': 'New Place',
            'restaurant_slug': 'new-place',
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)

    def test_signup_serializer_duplicate_slug(self):
        owner = self.create_user()
        self.create_restaurant(owner=owner, slug='taken-slug')
        serializer = RestaurantSignupSerializer(data={
            'username': 'brand_new',
            'password': 'password123',
            'email': 'brand@test.com',
            'restaurant_name': 'New Place',
            'restaurant_slug': 'taken-slug',
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('restaurant_slug', serializer.errors)

    def test_menu_item_serializer(self):
        item = self.create_menu_item(name='Latte', price=Decimal('4.50'))
        serializer = MenuItemSerializer(item)
        data = serializer.data
        self.assertEqual(data['name'], 'Latte')
        self.assertEqual(data['price'], '4.50')
        self.assertIn('translations', data)
        self.assertIn('category_name', data)

    def test_table_serializer(self):
        restaurant = self.create_restaurant()
        table = self.create_table(restaurant=restaurant, number=7)
        serializer = TableSerializer(table)
        data = serializer.data
        self.assertEqual(data['number'], 7)

    def test_customer_serializer(self):
        customer = self.create_customer(name='Alice', phone_number='+919000000001')
        serializer = CustomerSerializer(customer)
        data = serializer.data
        self.assertEqual(data['name'], 'Alice')
        self.assertEqual(data['phone_number'], '+919000000001')


# ===========================================================================
# Permission Tests
# ===========================================================================

class PermissionTests(TestCase, TestDataMixin):
    """Tests for role-based permission classes."""

    def _make_request(self, user=None, method='GET'):
        from rest_framework.test import APIRequestFactory
        factory = APIRequestFactory()
        if method == 'GET':
            request = factory.get('/')
        else:
            request = factory.post('/')
        request.user = user
        return request

    def test_is_admin_allows_admin(self):
        data = self.setup_full_restaurant()
        request = self._make_request(data['admin_user'])
        self.assertTrue(IsAdmin().has_permission(request, None))

    def test_is_admin_denies_waiter(self):
        data = self.setup_full_restaurant()
        request = self._make_request(data['waiter_user'])
        self.assertFalse(IsAdmin().has_permission(request, None))

    def test_is_staff_allows_all_roles(self):
        data = self.setup_full_restaurant()
        for role_user in ['admin_user', 'waiter_user', 'kitchen_user', 'biller_user']:
            request = self._make_request(data[role_user])
            self.assertTrue(
                IsStaff().has_permission(request, None),
                f"{role_user} should be allowed by IsStaff"
            )

    def test_is_admin_or_read_only_allows_get(self):
        from django.contrib.auth.models import AnonymousUser
        request = self._make_request(AnonymousUser(), method='GET')
        self.assertTrue(IsAdminOrReadOnly().has_permission(request, None))

    def test_is_admin_or_read_only_denies_post_anon(self):
        from django.contrib.auth.models import AnonymousUser
        request = self._make_request(AnonymousUser(), method='POST')
        self.assertFalse(IsAdminOrReadOnly().has_permission(request, None))

    def test_is_admin_or_kitchen(self):
        data = self.setup_full_restaurant()
        admin_req = self._make_request(data['admin_user'])
        kitchen_req = self._make_request(data['kitchen_user'])
        waiter_req = self._make_request(data['waiter_user'])
        self.assertTrue(IsAdminOrKitchen().has_permission(admin_req, None))
        self.assertTrue(IsAdminOrKitchen().has_permission(kitchen_req, None))
        self.assertFalse(IsAdminOrKitchen().has_permission(waiter_req, None))

    def test_is_biller_or_admin(self):
        data = self.setup_full_restaurant()
        admin_req = self._make_request(data['admin_user'])
        biller_req = self._make_request(data['biller_user'])
        waiter_req = self._make_request(data['waiter_user'])
        self.assertTrue(IsBillerOrAdmin().has_permission(admin_req, None))
        self.assertTrue(IsBillerOrAdmin().has_permission(biller_req, None))
        self.assertFalse(IsBillerOrAdmin().has_permission(waiter_req, None))

    def test_inactive_profile_denied(self):
        data = self.setup_full_restaurant()
        data['admin_profile'].is_active = False
        data['admin_profile'].save()
        request = self._make_request(data['admin_user'])
        self.assertFalse(IsAdmin().has_permission(request, None))

    def test_unauthenticated_denied(self):
        from django.contrib.auth.models import AnonymousUser
        request = self._make_request(AnonymousUser())
        self.assertFalse(IsAdmin().has_permission(request, None))
        self.assertFalse(IsStaff().has_permission(request, None))


# ===========================================================================
# API Endpoint Tests
# ===========================================================================

@override_settings(
    DATABASES={'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}},
)
class AuthAPITest(APITestCase, TestDataMixin):
    """Tests for authentication API endpoints."""

    def setUp(self):
        self.client = APIClient()
        self.data = self.setup_full_restaurant()

    def test_staff_login_success(self):
        response = self.client.post('/api/v1/auth/login/', {
            'username': 'admin_user',
            'password': 'adminpass123',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['role'], 'admin')
        self.assertEqual(response.data['user']['username'], 'admin_user')

    def test_staff_login_wrong_password(self):
        response = self.client.post('/api/v1/auth/login/', {
            'username': 'admin_user',
            'password': 'wrongpassword',
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_staff_login_nonexistent_user(self):
        response = self.client.post('/api/v1/auth/login/', {
            'username': 'nobody',
            'password': 'password123',
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_staff_me_authenticated(self):
        self.client.force_authenticate(user=self.data['admin_user'])
        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'admin')

    def test_staff_me_unauthenticated(self):
        response = self.client.get('/api/v1/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_restaurant_signup(self):
        response = self.client.post('/api/v1/auth/signup/', {
            'username': 'newowner',
            'password': 'newpass12345',
            'email': 'newowner@test.com',
            'restaurant_name': 'New Restaurant',
            'restaurant_slug': 'new-restaurant',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['role'], 'admin')
        self.assertEqual(response.data['restaurant']['name'], 'New Restaurant')

    def test_restaurant_signup_duplicate_username(self):
        response = self.client.post('/api/v1/auth/signup/', {
            'username': 'admin_user',  # Already exists
            'password': 'newpass12345',
            'email': 'unique@test.com',
            'restaurant_name': 'Another Place',
            'restaurant_slug': 'another-place',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(
    DATABASES={'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}},
)
class CategoryAPITest(APITestCase, TestDataMixin):
    """Tests for Category API endpoints."""

    def setUp(self):
        self.data = self.setup_full_restaurant()
        self.client = APIClient()

    def test_list_categories_as_admin(self):
        self.client.force_authenticate(user=self.data['admin_user'])
        response = self.client.get('/api/v1/categories/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_category_as_admin(self):
        self.client.force_authenticate(user=self.data['admin_user'])
        response = self.client.post('/api/v1/categories/', {
            'name': 'Desserts',
            'display_order': 3,
            'restaurant': str(self.data['restaurant'].id),
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Desserts')

    def test_create_category_as_waiter_denied(self):
        self.client.force_authenticate(user=self.data['waiter_user'])
        response = self.client.post('/api/v1/categories/', {
            'name': 'Denied Category',
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_public_categories_by_slug(self):
        response = self.client.get('/api/v1/categories/', {'restaurant': 'test-resto'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)


@override_settings(
    DATABASES={'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}},
)
class MenuItemAPITest(APITestCase, TestDataMixin):
    """Tests for MenuItem API endpoints."""

    def setUp(self):
        self.data = self.setup_full_restaurant()
        self.client = APIClient()

    def test_list_menu_items_as_admin(self):
        self.client.force_authenticate(user=self.data['admin_user'])
        response = self.client.get('/api/v1/menu-items/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_menu_item(self):
        self.client.force_authenticate(user=self.data['admin_user'])
        response = self.client.post('/api/v1/menu-items/', {
            'category': self.data['category'].id,
            'name': 'New Dish',
            'price': '19.99',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_public_menu_items_by_slug(self):
        response = self.client.get('/api/v1/menu-items/', {'restaurant': 'test-resto'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)


@override_settings(
    DATABASES={'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}},
)
class TableAPITest(APITestCase, TestDataMixin):
    """Tests for Table API endpoints."""

    def setUp(self):
        self.data = self.setup_full_restaurant()
        self.client = APIClient()

    def test_list_tables(self):
        self.client.force_authenticate(user=self.data['admin_user'])
        response = self.client.get('/api/v1/tables/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_table(self):
        self.client.force_authenticate(user=self.data['admin_user'])
        response = self.client.post('/api/v1/tables/', {
            'number': 10,
            'capacity': 8,
            'restaurant': str(self.data['restaurant'].id),
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_table_as_waiter_denied(self):
        self.client.force_authenticate(user=self.data['waiter_user'])
        response = self.client.post('/api/v1/tables/', {
            'number': 99,
            'capacity': 2,
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


@override_settings(
    DATABASES={'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}},
)
class OrderAPITest(APITestCase, TestDataMixin):
    """Tests for Order API endpoints."""

    def setUp(self):
        self.data = self.setup_full_restaurant()
        self.client = APIClient()

    def test_create_order_public(self):
        """Customer order creation — no auth required."""
        response = self.client.post('/api/v1/orders/', {
            'restaurant_slug': 'test-resto',
            'table_number': 1,
            'phone_number': '+919999999999',
            'customer_name': 'Customer',
            'items': [
                {'menu_item': self.data['item1'].id, 'quantity': 2},
                {'menu_item': self.data['item2'].id, 'quantity': 1},
            ],
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'pending')
        self.assertEqual(len(response.data['items']), 2)

    def test_create_order_invalid_restaurant(self):
        response = self.client.post('/api/v1/orders/', {
            'restaurant_slug': 'nonexistent',
            'phone_number': '+919999999999',
            'items': [
                {'menu_item': self.data['item1'].id, 'quantity': 1},
            ],
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_list_orders_as_staff(self):
        self.client.force_authenticate(user=self.data['waiter_user'])
        response = self.client.get('/api/v1/orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_order_status(self):
        # First create an order
        order = self.create_order(
            restaurant=self.data['restaurant'],
            table=self.data['table'],
        )
        self.client.force_authenticate(user=self.data['kitchen_user'])
        response = self.client.patch(f'/api/v1/orders/{order.id}/update_status/', {
            'status': 'preparing',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'preparing')

    def test_track_order_public(self):
        order = self.create_order(restaurant=self.data['restaurant'])
        response = self.client.get('/api/v1/orders/track/', {'order_id': str(order.id)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], str(order.id))

    def test_track_order_missing_id(self):
        response = self.client.get('/api/v1/orders/track/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_filter_orders_by_status(self):
        self.create_order(restaurant=self.data['restaurant'], status='pending')
        self.create_order(restaurant=self.data['restaurant'], status='preparing')
        self.client.force_authenticate(user=self.data['waiter_user'])
        response = self.client.get('/api/v1/orders/', {'status': 'pending'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for order in response.data['results']:
            self.assertEqual(order['status'], 'pending')


@override_settings(
    DATABASES={'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}},
)
class BillAPITest(APITestCase, TestDataMixin):
    """Tests for Bill API endpoints."""

    def setUp(self):
        self.data = self.setup_full_restaurant()
        self.client = APIClient()

    def test_create_bill(self):
        order = self.create_order(
            restaurant=self.data['restaurant'],
            customer=self.data['customer'],
            total_amount=Decimal('50.00'),
        )
        self.client.force_authenticate(user=self.data['biller_user'])
        response = self.client.post('/api/v1/bills/', {
            'order_ids': [str(order.id)],
            'discount_amount': '5.00',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_pay_bill(self):
        order = self.create_order(
            restaurant=self.data['restaurant'],
            customer=self.data['customer'],
            total_amount=Decimal('100.00'),
        )
        bill = Bill.objects.create(restaurant=self.data['restaurant'])
        bill.orders.add(order)
        bill.recalculate()

        self.client.force_authenticate(user=self.data['biller_user'])
        response = self.client.patch(f'/api/v1/bills/{bill.id}/pay/', {
            'payment_status': 'paid',
            'payment_method': 'upi',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['payment_status'], 'paid')

    def test_bill_as_waiter_denied(self):
        self.client.force_authenticate(user=self.data['waiter_user'])
        response = self.client.get('/api/v1/bills/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_bill_lookup_requires_param(self):
        self.client.force_authenticate(user=self.data['biller_user'])
        response = self.client.get('/api/v1/bills/lookup/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(
    DATABASES={'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}},
)
class StaffAPITest(APITestCase, TestDataMixin):
    """Tests for Staff Management API endpoints."""

    def setUp(self):
        self.data = self.setup_full_restaurant()
        self.client = APIClient()

    def test_list_staff(self):
        self.client.force_authenticate(user=self.data['admin_user'])
        response = self.client.get('/api/v1/staff/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_staff(self):
        self.client.force_authenticate(user=self.data['admin_user'])
        response = self.client.post('/api/v1/staff/', {
            'username': 'new_waiter',
            'password': 'waiter12345',
            'first_name': 'New',
            'last_name': 'Waiter',
            'role': 'waiter',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['role'], 'waiter')

    def test_create_staff_as_waiter_denied(self):
        self.client.force_authenticate(user=self.data['waiter_user'])
        response = self.client.post('/api/v1/staff/', {
            'username': 'hack',
            'password': 'hacker12345',
            'role': 'admin',
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_staff(self):
        self.client.force_authenticate(user=self.data['admin_user'])
        profile = self.data['waiter_profile']
        response = self.client.delete(f'/api/v1/staff/{profile.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(StaffProfile.objects.filter(id=profile.id).exists())


@override_settings(
    DATABASES={'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}},
)
class AnalyticsAPITest(APITestCase, TestDataMixin):
    """Tests for Analytics API endpoints."""

    def setUp(self):
        self.data = self.setup_full_restaurant()
        self.client = APIClient()

    def test_summary_as_admin(self):
        self.client.force_authenticate(user=self.data['admin_user'])
        response = self.client.get('/api/v1/analytics/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_orders', response.data)
        self.assertIn('total_revenue', response.data)
        self.assertIn('total_customers', response.data)
        self.assertIn('avg_order_value', response.data)

    def test_sales_by_day(self):
        self.client.force_authenticate(user=self.data['admin_user'])
        response = self.client.get('/api/v1/analytics/sales_by_day/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_popular_items(self):
        self.client.force_authenticate(user=self.data['admin_user'])
        response = self.client.get('/api/v1/analytics/popular_items/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_peak_hours(self):
        self.client.force_authenticate(user=self.data['admin_user'])
        response = self.client.get('/api/v1/analytics/peak_hours/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_revenue_by_category(self):
        self.client.force_authenticate(user=self.data['admin_user'])
        response = self.client.get('/api/v1/analytics/revenue_by_category/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_analytics_as_waiter_denied(self):
        self.client.force_authenticate(user=self.data['waiter_user'])
        response = self.client.get('/api/v1/analytics/summary/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


@override_settings(
    DATABASES={'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}},
)
class TokenAPITest(APITestCase, TestDataMixin):
    """Tests for Token API endpoints."""

    def setUp(self):
        self.data = self.setup_full_restaurant()
        self.client = APIClient()

    def test_create_token_as_staff(self):
        self.client.force_authenticate(user=self.data['waiter_user'])
        response = self.client.post('/api/v1/tokens/', {
            'restaurant': str(self.data['restaurant'].id),
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['number'], 1)

    def test_create_second_token(self):
        Token.objects.create(restaurant=self.data['restaurant'], number=1)
        self.client.force_authenticate(user=self.data['waiter_user'])
        response = self.client.post('/api/v1/tokens/', {
            'restaurant': str(self.data['restaurant'].id),
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['number'], 2)

    def test_list_today_tokens(self):
        Token.objects.create(restaurant=self.data['restaurant'], number=1)
        self.client.force_authenticate(user=self.data['waiter_user'])
        response = self.client.get('/api/v1/tokens/', {'today': 'true'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)


@override_settings(
    DATABASES={'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}},
)
class CustomerAPITest(APITestCase, TestDataMixin):
    """Tests for Customer API endpoints."""

    def setUp(self):
        self.data = self.setup_full_restaurant()
        self.client = APIClient()

    def test_list_customers(self):
        self.client.force_authenticate(user=self.data['waiter_user'])
        response = self.client.get('/api/v1/customers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_filter_customers_by_phone(self):
        self.client.force_authenticate(user=self.data['waiter_user'])
        response = self.client.get('/api/v1/customers/', {'phone': '+911234567890'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)


@override_settings(
    DATABASES={'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}},
)
class MultiTenantIsolationTest(APITestCase, TestDataMixin):
    """Tests to verify data isolation between restaurants."""

    def test_staff_cannot_see_other_restaurants_orders(self):
        # Setup restaurant 1
        data1 = self.setup_full_restaurant()
        order1 = self.create_order(restaurant=data1['restaurant'])

        # Setup restaurant 2
        owner2 = self.create_user(username='owner2', password='pass123', email='o2@t.com')
        rest2 = self.create_restaurant(owner=owner2, slug='rest2')
        staff2_user = self.create_user(username='staff2', password='pass123')
        self.create_staff_profile(user=staff2_user, restaurant=rest2, role='waiter')
        order2 = self.create_order(restaurant=rest2)

        # Staff of restaurant 1 should only see restaurant 1's orders
        self.client.force_authenticate(user=data1['waiter_user'])
        response = self.client.get('/api/v1/orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        order_ids = [o['id'] for o in response.data['results']]
        self.assertIn(str(order1.id), order_ids)
        self.assertNotIn(str(order2.id), order_ids)

    def test_admin_cannot_see_other_restaurants_staff(self):
        data1 = self.setup_full_restaurant()

        owner2 = self.create_user(username='owner2b', password='pass123', email='o2b@t.com')
        rest2 = self.create_restaurant(owner=owner2, slug='rest2b')
        self.create_staff_profile(user=owner2, restaurant=rest2, role='admin')

        self.client.force_authenticate(user=data1['admin_user'])
        response = self.client.get('/api/v1/staff/')
        # Restaurant field can be either UUID string or plain string
        expected_id = str(data1['restaurant'].id)
        for staff_entry in response.data['results']:
            self.assertEqual(str(staff_entry['restaurant']), expected_id)


@override_settings(
    DATABASES={'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}},
)
class RestaurantAPITest(APITestCase, TestDataMixin):
    """Tests for Restaurant API endpoints."""

    def setUp(self):
        self.data = self.setup_full_restaurant()
        self.client = APIClient()

    def test_get_restaurant_as_admin(self):
        self.client.force_authenticate(user=self.data['admin_user'])
        response = self.client.get('/api/v1/restaurants/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_restaurant_theming(self):
        self.client.force_authenticate(user=self.data['admin_user'])
        response = self.client.patch(
            f'/api/v1/restaurants/{self.data["restaurant"].slug}/',
            {'primary_color': '#FF5722', 'font_family': 'Roboto'},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['primary_color'], '#FF5722')
        self.assertEqual(response.data['font_family'], 'Roboto')

    def test_public_restaurant_endpoint(self):
        response = self.client.get(
            f'/api/v1/restaurants/{self.data["restaurant"].slug}/public/'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn('address', response.data)
