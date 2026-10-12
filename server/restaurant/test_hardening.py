"""Regression coverage for tenant boundaries and restaurant service integrity."""
from decimal import Decimal
from io import StringIO
from unittest.mock import patch
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import override_settings
from rest_framework.test import APITestCase
from restaurant.tests import TestDataMixin
from restaurant.models import Order, Customer, Token, Bill, MenuItem, Recipe, Restaurant

@override_settings(PASSWORD_HASHERS=['django.contrib.auth.hashers.MD5PasswordHasher'])
class ProductionFlowTests(APITestCase, TestDataMixin):
    @classmethod
    def setUpTestData(cls):
        factory = TestDataMixin()
        cls.data = factory.setup_full_restaurant()
        cls.other = factory.create_restaurant(slug='other-restaurant')
        cls.other_category = factory.create_category(restaurant=cls.other)
        cls.other_item = factory.create_menu_item(category=cls.other_category)

    def setUp(self):
        self.client.force_authenticate(user=self.data['admin_user'])

    def order(self, **extra):
        return self.create_order(restaurant=self.data['restaurant'], table=self.data['table'],
                                 customer=self.data['customer'], total_amount=Decimal('100.00'), **extra)

    def test_foreign_category_rejected_on_create_and_update(self):
        payload = {'category': self.other_category.pk, 'name': 'Foreign', 'price': '1.00'}
        self.assertEqual(self.client.post('/api/v1/menu-items/', payload).status_code, 400)
        self.assertEqual(self.client.patch(f"/api/v1/menu-items/{self.data['item1'].pk}/", payload).status_code, 400)

    def test_foreign_recipe_and_translation_rejected(self):
        self.assertEqual(self.client.post('/api/v1/recipes/', {'menu_item': self.other_item.pk, 'ingredients': 'Test', 'instructions': 'Test'}).status_code, 400)
        self.assertEqual(self.client.post('/api/v1/translations/', {'menu_item': self.other_item.pk, 'language_code': 'fr', 'translated_name': 'Test'}).status_code, 400)

    def test_staff_tenant_cannot_be_changed(self):
        response = self.client.patch(f"/api/v1/staff/{self.data['waiter_profile'].pk}/", {'restaurant': str(self.other.pk)})
        self.assertEqual(response.status_code, 200)
        self.data['waiter_profile'].refresh_from_db()
        self.assertEqual(self.data['waiter_profile'].restaurant_id, self.data['restaurant'].pk)

    def test_inactive_restaurant_cannot_write(self):
        Restaurant.objects.filter(pk=self.data['restaurant'].pk).update(is_active=False)
        from django.contrib.auth.models import User
        self.client.force_authenticate(user=User.objects.get(pk=self.data['admin_user'].pk))
        self.assertEqual(self.client.post('/api/v1/categories/', {'name': 'Blocked'}).status_code, 403)

    def test_public_tables_do_not_expose_internal_fields(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/v1/tables/public/', {'restaurant': 'test-resto'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]['number'], 1)
        self.assertNotIn('qr_code', response.data[0])
        self.assertNotIn('restaurant', response.data[0])
        self.assertEqual(self.client.get('/api/v1/tables/').status_code, 401)

    def test_waiter_can_read_tables_but_cannot_edit(self):
        self.client.force_authenticate(user=self.data['waiter_user'])
        self.assertEqual(self.client.get('/api/v1/tables/').status_code, 200)
        self.assertEqual(self.client.patch(f"/api/v1/tables/{self.data['table'].pk}/", {'number': 9}).status_code, 403)

    def test_signed_in_staff_can_view_another_public_menu(self):
        response = self.client.get('/api/v1/categories/', {'restaurant': self.other.slug, 'nested': 'true'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['results'][0]['id'], self.other_category.pk)
        self.assertEqual(self.client.get(f'/api/v1/restaurants/{self.other.slug}/public/').status_code, 200)

    def test_tracking_rejects_invalid_uuid_and_redacts_phone(self):
        order = self.order()
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.get('/api/v1/orders/track/', {'order_id': 'invalid'}).status_code, 400)
        response = self.client.get('/api/v1/orders/track/', {'order_id': order.pk})
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('customer_phone', response.data)
        self.assertNotIn('customer', response.data)

    def test_table_lookup_is_public_and_scoped(self):
        self.order()
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/v1/orders/by_table/', {'restaurant': 'test-resto', 'table': 1, 'phone': self.data['customer'].phone_number})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertNotIn('customer_phone', response.data[0])

    def test_invalid_order_rolls_back_customer_and_token(self):
        Restaurant.objects.filter(pk=self.data['restaurant'].pk).update(workflow_type='token')
        before = (Order.objects.count(), Customer.objects.count(), Token.objects.count())
        response = self.client.post('/api/v1/orders/', {'restaurant_slug': 'test-resto', 'phone_number': '9999999999', 'items': [{'menu_item': self.other_item.pk, 'quantity': 1}]}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(before, (Order.objects.count(), Customer.objects.count(), Token.objects.count()))

    def test_table_order_requires_table(self):
        response = self.client.post('/api/v1/orders/', {'restaurant_slug': 'test-resto', 'phone_number': '9999999999', 'items': [{'menu_item': self.data['item1'].pk}]}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_counter_order_requires_cashier(self):
        Restaurant.objects.filter(pk=self.data['restaurant'].pk).update(workflow_type='shop')
        payload = {'restaurant_slug': 'test-resto', 'phone_number': '9999999999', 'items': [{'menu_item': self.data['item1'].pk}]}
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.post('/api/v1/orders/', payload, format='json').status_code, 403)
        self.client.force_authenticate(user=self.data['biller_user'])
        self.assertEqual(self.client.post('/api/v1/orders/', payload, format='json').status_code, 201)

    def test_order_patch_cannot_reassign_tenant(self):
        order = self.order()
        self.assertEqual(self.client.patch(f'/api/v1/orders/{order.pk}/', {'restaurant': str(self.other.pk)}).status_code, 405)
        order.refresh_from_db()
        self.assertEqual(order.restaurant_id, self.data['restaurant'].pk)

    def test_role_and_terminal_transition_rules(self):
        order = self.order(status='ready')
        self.client.force_authenticate(user=self.data['kitchen_user'])
        self.assertEqual(self.client.patch(f'/api/v1/orders/{order.pk}/update_status/', {'status': 'served'}).status_code, 403)
        self.client.force_authenticate(user=self.data['waiter_user'])
        self.assertEqual(self.client.patch(f'/api/v1/orders/{order.pk}/update_status/', {'status': 'served'}).status_code, 200)
        self.client.force_authenticate(user=self.data['admin_user'])
        self.assertEqual(self.client.patch(f'/api/v1/orders/{order.pk}/update_status/', {'status': 'preparing'}).status_code, 400)

    def test_duplicate_empty_cancelled_and_excess_discount_bills_rejected(self):
        order = self.order()
        self.assertEqual(self.client.post('/api/v1/bills/', {'order_ids': []}, format='json').status_code, 400)
        self.assertEqual(self.client.post('/api/v1/bills/', {'order_ids': [str(order.pk)], 'discount_amount': '101.00'}, format='json').status_code, 400)
        payload = {'order_ids': [str(order.pk)]}
        self.assertEqual(self.client.post('/api/v1/bills/', payload, format='json').status_code, 201)
        self.assertEqual(self.client.post('/api/v1/bills/', payload, format='json').status_code, 400)
        cancelled = self.order(status='cancelled')
        self.assertEqual(self.client.post('/api/v1/bills/', {'order_ids': [str(cancelled.pk)]}, format='json').status_code, 400)

    def test_payment_does_not_serve_food_and_cannot_be_reversed(self):
        order = self.order(status='preparing')
        bill = self.client.post('/api/v1/bills/', {'order_ids': [str(order.pk)]}, format='json').data
        url = f"/api/v1/bills/{bill['id']}/pay/"
        self.assertEqual(self.client.patch(url, {'payment_status': 'paid', 'payment_method': 'cash'}).status_code, 200)
        order.refresh_from_db()
        self.assertEqual(order.status, 'preparing')
        self.assertEqual(self.client.patch(url, {'payment_status': 'unpaid'}).status_code, 400)
        self.assertEqual(self.client.patch(f"/api/v1/bills/{bill['id']}/", {'payment_status': 'unpaid'}).status_code, 405)
        self.assertEqual(self.client.delete(f"/api/v1/bills/{bill['id']}/").status_code, 405)

    def test_ordered_menu_item_and_table_cannot_be_deleted(self):
        from restaurant.models import OrderItem
        order = self.order()
        OrderItem.objects.create(order=order, menu_item=self.data['item1'], quantity=1, unit_price=Decimal('10'))
        self.assertEqual(self.client.delete(f"/api/v1/menu-items/{self.data['item1'].pk}/").status_code, 400)
        self.assertTrue(MenuItem.objects.filter(pk=self.data['item1'].pk).exists())
        self.assertEqual(self.client.delete(f"/api/v1/tables/{self.data['table'].pk}/").status_code, 400)

    def test_owner_cannot_delete_their_own_account(self):
        self.assertEqual(self.client.delete(f"/api/v1/staff/{self.data['admin_profile'].pk}/").status_code, 400)

    def test_invalid_analytics_range_returns_validation_error(self):
        self.assertEqual(self.client.get('/api/v1/analytics/summary/', {'days': 'abc'}).status_code, 400)
        self.assertEqual(self.client.get('/api/v1/analytics/summary/', {'days': -1}).status_code, 400)

    def test_bootstrap_never_overwrites_existing_user(self):
        before = self.data['admin_user'].password
        with patch.dict('os.environ', {'RMS_ADMIN_USERNAME': 'admin_user', 'RMS_ADMIN_EMAIL': 'qa@example.test', 'RMS_ADMIN_PASSWORD': 'Synthetic-only-98642'}):
            with self.assertRaises(CommandError):
                call_command('seed_platform_admin', stdout=StringIO())
        self.data['admin_user'].refresh_from_db()
        self.assertEqual(before, self.data['admin_user'].password)

    def test_optional_checkout_name_and_phone_format(self):
        self.client.force_authenticate(user=None)
        response = self.client.post('/api/v1/orders/', {'restaurant_slug': 'test-resto',
            'table_number': 1, 'phone_number': '+91 99999 99999', 'customer_name': '',
            'items': [{'menu_item': self.data['item1'].pk, 'quantity': 1, 'notes': ''}]}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Customer.objects.get(pk=response.data['customer']).phone_number, '+919999999999')

    def test_signup_accepts_empty_optional_fields(self):
        self.client.force_authenticate(user=None)
        response = self.client.post('/api/v1/auth/signup/', {'username': 'new_owner',
            'password': 'Synthetic-only-123!', 'email': 'owner@example.test', 'first_name': 'New',
            'last_name': 'Owner', 'restaurant_name': 'New Venue', 'restaurant_slug': 'new-venue',
            'phone_number': '', 'restaurant_description': '', 'restaurant_address': '', 'restaurant_phone': ''}, format='json')
        self.assertEqual(response.status_code, 201)

    def test_order_retry_returns_original_and_changed_payload_rejected(self):
        import uuid
        self.client.force_authenticate(user=None)
        key = str(uuid.uuid4())
        payload = {'restaurant_slug': 'test-resto', 'table_number': 1, 'phone_number': '9999999999',
                   'items': [{'menu_item': self.data['item1'].pk, 'quantity': 1}]}
        first = self.client.post('/api/v1/orders/', payload, format='json', HTTP_IDEMPOTENCY_KEY=key)
        retry = self.client.post('/api/v1/orders/', payload, format='json', HTTP_IDEMPOTENCY_KEY=key)
        self.assertEqual(first.status_code, 201)
        self.assertEqual(retry.status_code, 200)
        self.assertEqual(first.data['id'], retry.data['id'])
        self.assertEqual(Order.objects.count(), 1)
        payload['items'][0]['quantity'] = 2
        self.assertEqual(self.client.post('/api/v1/orders/', payload, format='json', HTTP_IDEMPOTENCY_KEY=key).status_code, 400)

    def test_receipt_dish_name_survives_menu_rename(self):
        from restaurant.models import OrderItem
        from restaurant.serializers import OrderSerializer
        order = self.order()
        OrderItem.objects.create(order=order, menu_item=self.data['item1'], quantity=1, unit_price=Decimal('10'))
        MenuItem.objects.filter(pk=self.data['item1'].pk).update(name='Renamed dish')
        self.assertEqual(OrderSerializer(order).data['items'][0]['menu_item_name'], 'Burger')
