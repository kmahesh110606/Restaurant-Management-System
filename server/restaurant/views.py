"""
DRF ViewSets and API views for the Restaurant Management Service.

Multi-tenant: All querysets are filtered by the authenticated user's
restaurant (for staff endpoints) or by the restaurant slug in the URL
(for public/customer endpoints).
"""

import hashlib
import json
from datetime import timedelta
from decimal import Decimal
from uuid import UUID

from django.db import transaction
from django.db.models.deletion import ProtectedError
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError, PermissionDenied, MethodNotAllowed

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Sum, Count, F
from django.db.models.functions import TruncDate, TruncHour
from django.utils import timezone

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from restaurant.models import (
    Restaurant, Category, MenuItem, MenuTranslation, Recipe,
    Table, Token, Customer, Order, OrderItem, Bill, StaffProfile,
    SafetyLog,
)
from restaurant.serializers import (
    RestaurantSerializer, RestaurantPublicSerializer,
    CategorySerializer, CategoryListSerializer,
    MenuItemSerializer, MenuItemWriteSerializer,
    MenuTranslationSerializer, RecipeSerializer,
    TableSerializer, TokenSerializer,
    CustomerSerializer,
    OrderSerializer, PublicOrderSerializer, OrderCreateSerializer, OrderStatusUpdateSerializer,
    OrderItemSerializer,
    BillSerializer, BillCreateSerializer, BillPaymentSerializer,
    StaffProfileSerializer, StaffCreateSerializer,
    LoginSerializer, GoogleLoginSerializer, RestaurantSignupSerializer,
)
from restaurant.permissions import (
    IsAdmin, IsStaff, IsAdminOrReadOnly, IsAdminOrKitchen, IsBillerOrAdmin,
    IsSuperUserOrPlatformAdmin,
)
from restaurant.utils import generate_qr_code, get_next_token_number, log_safety_event


# ===========================================================================
# Helper: get restaurant from authenticated user
# ===========================================================================

def _get_user_restaurant(user):
    """Return the restaurant that the authenticated staff user belongs to."""
    profile = getattr(user, 'staff_profile', None)
    if profile and profile.is_active and profile.restaurant.is_active:
        return profile.restaurant
    return None


def _positive_param(request, name, default, maximum):
    try:
        value = int(request.query_params.get(name, default))
    except (TypeError, ValueError):
        raise ValidationError({name: 'Enter a whole number.'})
    if not 1 <= value <= maximum:
        raise ValidationError({name: f'Enter a value between 1 and {maximum}.'})
    return value


def _get_today_range():
    """Return timezone-aware start and end datetime for today."""
    now = timezone.localtime()
    return (
        now.replace(hour=0, minute=0, second=0, microsecond=0),
        now.replace(hour=23, minute=59, second=59, microsecond=999999),
    )


# ===========================================================================
# Auth
# ===========================================================================

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def staff_login(request):
    """
    Staff-only login endpoint. Returns JWT access + refresh tokens along
    with the user's role and restaurant info.
    """
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = authenticate(
        username=serializer.validated_data['username'],
        password=serializer.validated_data['password'],
    )
    ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', ''))
    if ip and ',' in ip:
        ip = ip.split(',')[0].strip()

    if user is None:
        log_safety_event(
            'login_failure',
            f"Failed sign-in attempt for username '{serializer.validated_data.get('username')}'.",
            severity='warning',
            ip_address=ip
        )
        return Response(
            {'detail': 'Invalid credentials.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    # Allow superuser / platform admin to sign in directly
    if user.is_superuser or user.is_staff:
        profile = getattr(user, 'staff_profile', None)
        refresh = RefreshToken.for_user(user)
        log_safety_event(
            'platform_login',
            f"Platform Superadmin '{user.username}' signed in to RMS management console.",
            severity='info',
            user=user,
            ip_address=ip
        )
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'is_superuser': True,
            },
            'role': profile.role if profile else 'platform_admin',
            'restaurant': RestaurantSerializer(profile.restaurant).data if profile else None,
        })

    profile = getattr(user, 'staff_profile', None)
    if profile is None or not profile.is_active or not profile.restaurant.is_active:
        log_safety_event(
            'login_denied',
            f"Sign-in denied for inactive staff user '{user.username}'.",
            severity='warning',
            user=user,
            ip_address=ip
        )
        return Response(
            {'detail': 'No active staff profile for this user.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    log_safety_event(
        'staff_login',
        f"Staff member '{user.username}' ({profile.get_role_display()}) signed in to '{profile.restaurant.name}'.",
        severity='info',
        user=user,
        restaurant=profile.restaurant,
        ip_address=ip
    )

    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'is_superuser': False,
        },
        'role': profile.role,
        'restaurant': RestaurantSerializer(profile.restaurant).data,
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def staff_me(request):
    """Return the currently authenticated staff user's profile."""
    if request.user.is_superuser:
        profile = getattr(request.user, 'staff_profile', None)
        return Response({
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'email': request.user.email,
                'is_superuser': True,
            },
            'role': profile.role if profile else 'platform_admin',
            'restaurant': RestaurantSerializer(profile.restaurant).data if profile else None,
        })

    profile = getattr(request.user, 'staff_profile', None)
    if profile is None:
        return Response({'detail': 'No staff profile.'}, status=status.HTTP_404_NOT_FOUND)

    return Response({
        'user': {
            'id': request.user.id,
            'username': request.user.username,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'email': request.user.email,
            'is_superuser': False,
        },
        'role': profile.role,
        'restaurant': RestaurantSerializer(profile.restaurant).data,
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def google_login(request):
    """
    Owner-only Google OAuth login.
    Validates a Google ID token, finds an existing admin user linked to
    that email, and returns JWT tokens.
    """
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    from django.conf import settings

    serializer = GoogleLoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    token = serializer.validated_data['id_token']

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError:
        return Response(
            {'detail': 'Invalid Google token.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    email = idinfo.get('email')
    if not email:
        return Response(
            {'detail': 'Google account has no email.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Find user by email — must be a restaurant owner (admin role)
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {'detail': 'No account found with this Google email. Please sign up first.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    profile = getattr(user, 'staff_profile', None)
    if profile is None or profile.role != 'admin':
        return Response(
            {'detail': 'Google sign-in is only available for restaurant owners.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    if not profile.is_active:
        return Response(
            {'detail': 'Your account is deactivated.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
        },
        'role': profile.role,
        'restaurant': RestaurantSerializer(profile.restaurant).data,
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def restaurant_signup(request):
    """
    Register a new restaurant owner with their restaurant.
    Creates User + Restaurant + StaffProfile (admin role) in one transaction.
    """
    from django.db import transaction

    serializer = RestaurantSignupSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    with transaction.atomic():
        # Create the owner user
        user = User.objects.create_user(
            username=data['username'],
            password=data['password'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            email=data['email'],
        )

        # Create the restaurant
        restaurant = Restaurant.objects.create(
            name=data['restaurant_name'],
            slug=data['restaurant_slug'],
            description=data.get('restaurant_description', ''),
            address=data.get('restaurant_address', ''),
            phone=data.get('restaurant_phone', ''),
            workflow_type=data.get('workflow_type', 'table'),
            primary_color=data.get('primary_color', '#E53935'),
            secondary_color=data.get('secondary_color', '#1a1a1a'),
            accent_color=data.get('accent_color', '#FFB300'),
            font_family=data.get('font_family', 'Inter'),
            owner=user,
        )

        # Create admin staff profile
        StaffProfile.objects.create(
            user=user,
            restaurant=restaurant,
            role='admin',
            phone_number=data.get('phone_number', ''),
        )

    # Auto-login: generate JWT tokens
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
        },
        'role': 'admin',
        'restaurant': RestaurantSerializer(restaurant).data,
    }, status=status.HTTP_201_CREATED)


# ===========================================================================
# Restaurant
# ===========================================================================

class RestaurantViewSet(viewsets.ModelViewSet):
    """
    Admin can CRUD their own restaurant.
    Public users can GET by slug.
    """
    serializer_class = RestaurantSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        if self.action == 'public':
            return Restaurant.objects.filter(is_active=True)
        if self.request.user.is_authenticated:
            restaurant = _get_user_restaurant(self.request.user)
            if restaurant:
                return Restaurant.objects.filter(pk=restaurant.pk)
        return Restaurant.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action in ('list', 'retrieve') and not self.request.user.is_authenticated:
            return RestaurantPublicSerializer
        return RestaurantSerializer

    def destroy(self, request, *args, **kwargs):
        raise MethodNotAllowed('DELETE', 'Deactivate restaurants through the platform console to preserve history.')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def public(self, request, slug=None):
        """Public endpoint to get restaurant info by slug."""
        restaurant = self.get_object()
        return Response(RestaurantPublicSerializer(restaurant).data)

    @action(detail=True, methods=['post', 'delete'], permission_classes=[IsAdmin])
    def remove_menu_background(self, request, slug=None):
        """Remove/delete the custom menu background image."""
        restaurant = self.get_object()
        if restaurant.menu_background:
            try:
                restaurant.menu_background.delete(save=False)
            except Exception:
                pass
            restaurant.menu_background = None
            restaurant.save(update_fields=['menu_background'])
        return Response(RestaurantSerializer(restaurant, context={'request': request}).data)


# ===========================================================================
# Category
# ===========================================================================

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError:
            raise ValidationError({'detail': 'This item is part of order history. Mark it unavailable instead.'})

    def get_queryset(self):
        slug = self.request.query_params.get('restaurant')
        if self.request.method in permissions.SAFE_METHODS and slug:
            return Category.objects.filter(restaurant__slug=slug, restaurant__is_active=True, is_active=True)
        # Staff: scoped to their restaurant
        if self.request.user.is_authenticated:
            restaurant = _get_user_restaurant(self.request.user)
            if restaurant:
                return Category.objects.filter(restaurant=restaurant)

        # Public: filter by restaurant_slug query param
        slug = self.request.query_params.get('restaurant')
        if slug:
            return Category.objects.filter(restaurant__slug=slug, is_active=True)
        return Category.objects.none()

    def get_serializer_class(self):
        if self.action == 'list' and self.request.query_params.get('nested') == 'true':
            return CategoryListSerializer
        return CategorySerializer

    def perform_create(self, serializer):
        restaurant = _get_user_restaurant(self.request.user)
        serializer.save(restaurant=restaurant)


# ===========================================================================
# MenuItem
# ===========================================================================

class MenuItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return MenuItemWriteSerializer
        return MenuItemSerializer

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except ProtectedError:
            raise ValidationError({'detail': 'This item is part of order history. Mark it unavailable instead.'})

    def get_queryset(self):
        slug = self.request.query_params.get('restaurant')
        if self.request.method in permissions.SAFE_METHODS and slug:
            return MenuItem.objects.filter(category__restaurant__slug=slug,
                category__restaurant__is_active=True, category__is_active=True,
                is_available=True).select_related('category')
        if self.request.user.is_authenticated:
            restaurant = _get_user_restaurant(self.request.user)
            if restaurant:
                return MenuItem.objects.filter(category__restaurant=restaurant).select_related('category')

        slug = self.request.query_params.get('restaurant')
        if slug:
            return MenuItem.objects.filter(
                category__restaurant__slug=slug,
                is_available=True,
                category__is_active=True,
            ).select_related('category')
        return MenuItem.objects.none()


# ===========================================================================
# MenuTranslation
# ===========================================================================

class MenuTranslationViewSet(viewsets.ModelViewSet):
    serializer_class = MenuTranslationSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        restaurant = _get_user_restaurant(self.request.user)
        if restaurant:
            return MenuTranslation.objects.filter(
                menu_item__category__restaurant=restaurant
            )
        return MenuTranslation.objects.none()


# ===========================================================================
# Recipe  (internal only — never public)
# ===========================================================================

class RecipeViewSet(viewsets.ModelViewSet):
    serializer_class = RecipeSerializer
    permission_classes = [IsAdminOrKitchen]

    def get_queryset(self):
        restaurant = _get_user_restaurant(self.request.user)
        if restaurant:
            return Recipe.objects.filter(
                menu_item__category__restaurant=restaurant
            ).select_related('menu_item')
        return Recipe.objects.none()


# ===========================================================================
# Table
# ===========================================================================

class TableViewSet(viewsets.ModelViewSet):
    serializer_class = TableSerializer
    permission_classes = [IsAdmin]

    def get_permissions(self):
        if self.action == 'public':
            return [permissions.AllowAny()]
        if self.action in ('list', 'retrieve'):
            return [IsStaff()]
        return [IsAdmin()]

    def get_queryset(self):
        restaurant = _get_user_restaurant(self.request.user)
        if restaurant:
            return Table.objects.filter(restaurant=restaurant)
        return Table.objects.none()

    def perform_destroy(self, instance):
        if instance.orders.exists():
            raise ValidationError({'detail': 'This table has order history. Deactivate it instead.'})
        instance.delete()

    def perform_create(self, serializer):
        restaurant = _get_user_restaurant(self.request.user)
        serializer.save(restaurant=restaurant)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def public(self, request):
        slug = request.query_params.get('restaurant')
        restaurant = get_object_or_404(Restaurant, slug=slug, is_active=True)
        tables = Table.objects.filter(restaurant=restaurant, is_active=True)
        return Response(list(tables.values('id', 'number', 'name', 'capacity', 'is_active')))

    @action(detail=True, methods=['post'])
    def regenerate_qr(self, request, pk=None):
        """Regenerate the QR code for a table."""
        table = self.get_object()
        from django.conf import settings
        base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        menu_url = f"{base_url}/{table.restaurant.slug}/menu?table={table.number}"
        qr_file = generate_qr_code(menu_url, filename_prefix=f'table_{table.number}')
        table.qr_code.save(qr_file.name, qr_file, save=True)
        return Response(TableSerializer(table).data)


# ===========================================================================
# Token
# ===========================================================================

class TokenViewSet(viewsets.ModelViewSet):
    serializer_class = TokenSerializer
    permission_classes = [IsStaff]
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        restaurant = _get_user_restaurant(self.request.user)
        if restaurant:
            qs = Token.objects.filter(restaurant=restaurant)
            # Optionally filter to today's tokens only
            today_only = self.request.query_params.get('today', 'false')
            if today_only.lower() == 'true':
                qs = qs.filter(created_at__range=_get_today_range())
            return qs
        return Token.objects.none()

    @transaction.atomic
    def perform_create(self, serializer):
        restaurant = _get_user_restaurant(self.request.user)
        Restaurant.objects.select_for_update().get(pk=restaurant.pk)
        next_number = get_next_token_number(restaurant)
        serializer.save(restaurant=restaurant, number=next_number)


# ===========================================================================
# Customer
# ===========================================================================

class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    permission_classes = [IsStaff]

    def perform_create(self, serializer):
        serializer.save(restaurant=_get_user_restaurant(self.request.user))

    def get_queryset(self):
        restaurant = _get_user_restaurant(self.request.user)
        if restaurant:
            qs = Customer.objects.filter(restaurant=restaurant)
            phone = self.request.query_params.get('phone')
            if phone:
                qs = qs.filter(phone_number=phone)
            return qs
        return Customer.objects.none()


# ===========================================================================
# Order
# ===========================================================================

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        if self.action in ('update', 'partial_update', 'update_status'):
            return [IsStaff()]
        if self.action == 'destroy':
            return [IsAdmin()]
        if self.action in ('track', 'by_table'):
            return [permissions.AllowAny()]
        return [IsStaff()]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            restaurant = _get_user_restaurant(self.request.user)
            if restaurant:
                qs = Order.objects.filter(restaurant=restaurant).select_related(
                    'table', 'token', 'customer',
                ).prefetch_related('items__menu_item')

                # Filter helpers for staff dashboards
                s = self.request.query_params.get('status')
                if s:
                    qs = qs.filter(status=s)
                table = self.request.query_params.get('table')
                if table:
                    qs = qs.filter(table__number=table)
                token = self.request.query_params.get('token')
                if token:
                    qs = qs.filter(token__number=token)
                today_only = self.request.query_params.get('today', 'false')
                if today_only.lower() == 'true':
                    qs = qs.filter(created_at__range=_get_today_range())
                return qs
        return Order.objects.none()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Customer-facing order creation.
        No authentication required.
        """
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Resolve restaurant
        try:
            restaurant = Restaurant.objects.select_for_update().get(slug=data['restaurant_slug'], is_active=True)
        except Restaurant.DoesNotExist:
            return Response(
                {'detail': 'Restaurant not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        request_key = request.headers.get('Idempotency-Key')
        fingerprint = ''
        if request_key:
            try:
                request_key = UUID(request_key)
            except (ValueError, TypeError):
                raise ValidationError({'detail': 'Invalid order request key.'})
            fingerprint = hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()
            existing = Order.objects.filter(restaurant=restaurant, request_key=request_key).first()
            if existing:
                if existing.request_fingerprint != fingerprint:
                    raise ValidationError({'detail': 'This request key belongs to a different order.'})
                return Response(OrderSerializer(existing).data, status=status.HTTP_200_OK)

        if restaurant.workflow_type == 'table' and not data.get('table_number'):
            raise ValidationError({'table_number': 'Select your table before ordering.'})
        if restaurant.workflow_type == 'shop':
            profile = getattr(request.user, 'staff_profile', None)
            if not profile or not profile.is_active or profile.restaurant_id != restaurant.pk or profile.role not in ('admin', 'biller'):
                raise PermissionDenied('Counter orders must be placed by the cashier.')

        # Get or create customer by phone
        customer, _ = Customer.objects.get_or_create(
            restaurant=restaurant,
            phone_number=data['phone_number'],
            defaults={'name': data.get('customer_name', '')},
        )

        # Determine order type from restaurant workflow
        order_type = restaurant.workflow_type
        table_obj = None
        token_obj = None

        if order_type == 'table' and data.get('table_number'):
            try:
                table_obj = Table.objects.get(
                    restaurant=restaurant,
                    number=data['table_number'],
                    is_active=True,
                )
            except Table.DoesNotExist:
                raise ValidationError({'table_number': 'This table is unavailable.'})
        elif order_type == 'token':
            next_num = get_next_token_number(restaurant)
            token_obj = Token.objects.create(restaurant=restaurant, number=next_num)

        # Create order
        order = Order.objects.create(
            restaurant=restaurant,
            request_key=request_key,
            request_fingerprint=fingerprint,
            order_type=order_type,
            table=table_obj,
            token=token_obj,
            customer=customer,
            status='pending',
            notes=data.get('notes', ''),
        )

        # Create order items
        total = 0
        for item_data in data['items']:
            try:
                menu_item = MenuItem.objects.get(
                    pk=item_data['menu_item'],
                    category__restaurant=restaurant,
                    is_available=True,
                    category__is_active=True,
                )
            except MenuItem.DoesNotExist:
                raise ValidationError({'detail': 'One or more menu items are unavailable.'})

            oi = OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=item_data['quantity'],
                unit_price=menu_item.price,
                notes=item_data.get('notes', ''),
            )
            total += oi.subtotal

        order.total_amount = total
        order.save(update_fields=['total_amount'])

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        raise MethodNotAllowed(request.method, 'Use update_status to change an order.')

    def destroy(self, request, *args, **kwargs):
        raise MethodNotAllowed('DELETE', 'Cancel orders to retain their history.')

    @action(detail=True, methods=['patch'])
    @transaction.atomic
    def update_status(self, request, pk=None):
        """Staff endpoint to update order status."""
        order = get_object_or_404(self.get_queryset().select_for_update(of=('self',)), pk=pk)
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        next_status = serializer.validated_data['status']
        transitions = {
            'pending': {'confirmed', 'preparing', 'cancelled'},
            'confirmed': {'preparing', 'cancelled'},
            'preparing': {'ready', 'cancelled'},
            'ready': {'served', 'cancelled'},
            'served': set(), 'cancelled': set(),
        }
        role = request.user.staff_profile.role
        role_statuses = {'admin': {'confirmed', 'preparing', 'ready', 'served', 'cancelled'},
                         'kitchen': {'confirmed', 'preparing', 'ready'},
                         'waiter': {'confirmed', 'served'}, 'biller': set()}
        if next_status not in role_statuses.get(role, set()):
            raise PermissionDenied('Your role cannot perform this transition.')
        if next_status != order.status and next_status not in transitions[order.status]:
            raise ValidationError({'detail': 'This order has changed. Refresh the queue.'})
        if next_status == 'cancelled' and order.bills.exists():
            raise ValidationError({'detail': 'Billed orders cannot be cancelled.'})
        order.status = next_status
        order.save(update_fields=['status', 'updated_at'])
        return Response(OrderSerializer(order).data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def track(self, request):
        """
        Customer order tracking by order ID.
        GET /api/v1/orders/track/?order_id=<uuid>
        """
        order_id = request.query_params.get('order_id')
        if not order_id:
            return Response({'detail': 'order_id required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            UUID(order_id)
        except (ValueError, TypeError):
            raise ValidationError({'order_id': 'Enter a valid order ID.'})
        try:
            order = Order.objects.select_related('table', 'token', 'customer').prefetch_related(
                'items__menu_item'
            ).get(pk=order_id, restaurant__is_active=True)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(PublicOrderSerializer(order).data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def by_table(self, request):
        """
        Get active (unpaid) orders for a table.
        GET /api/v1/orders/by_table/?restaurant=<slug>&table=<number>&phone=<phone>
        """
        slug = request.query_params.get('restaurant')
        table_num = request.query_params.get('table')
        phone = request.query_params.get('phone')

        if not all([slug, table_num, phone]):
            return Response(
                {'detail': 'restaurant, table, and phone are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            table_num = int(table_num)
        except (TypeError, ValueError):
            raise ValidationError({'table': 'Enter a valid table number.'})

        orders = Order.objects.filter(
            restaurant__slug=slug,
            restaurant__is_active=True,
            table__number=table_num,
            customer__phone_number=phone,
        ).exclude(
            status__in=['cancelled']
        ).exclude(
            bills__payment_status='paid',
        ).select_related('table', 'token', 'customer').prefetch_related('items__menu_item')

        return Response(PublicOrderSerializer(orders, many=True).data)


# ===========================================================================
# Bill
# ===========================================================================

class BillViewSet(viewsets.ModelViewSet):
    serializer_class = BillSerializer
    permission_classes = [IsBillerOrAdmin]

    def get_queryset(self):
        restaurant = _get_user_restaurant(self.request.user)
        if restaurant:
            qs = Bill.objects.filter(restaurant=restaurant).prefetch_related('orders__items__menu_item')
            payment_status = self.request.query_params.get('payment_status')
            if payment_status:
                qs = qs.filter(payment_status=payment_status)
            today_only = self.request.query_params.get('today', 'false')
            if today_only.lower() == 'true':
                qs = qs.filter(created_at__range=_get_today_range())
            return qs
        return Bill.objects.none()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create a bill from one or more order IDs."""
        serializer = BillCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        restaurant = _get_user_restaurant(request.user)
        orders = Order.objects.select_for_update().filter(
            pk__in=data['order_ids'],
            restaurant=restaurant,
        )
        if orders.count() != len(data['order_ids']):
            return Response(
                {'detail': 'One or more orders not found.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        list(orders)  # Acquire row locks before checking existing invoices.
        if orders.filter(bills__isnull=False).exists() or orders.filter(status='cancelled').exists():
            raise ValidationError({'detail': 'An order is cancelled or already billed. Open the existing bill.'})
        total = sum(order.total_amount for order in orders)
        tax = (total * Decimal(str(restaurant.tax_rate)) / Decimal('100')).quantize(Decimal('0.01'))
        if data.get('discount_amount', 0) > total + tax:
            raise ValidationError({'discount_amount': 'Discount cannot exceed the bill total.'})

        # Get customer from first order
        customer = orders.first().customer

        bill = Bill.objects.create(
            restaurant=restaurant,
            customer=customer,
            discount_amount=data.get('discount_amount', 0),
            notes=data.get('notes', ''),
            created_by=request.user,
        )
        bill.orders.set(orders)
        bill.recalculate()

        return Response(BillSerializer(bill).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        raise MethodNotAllowed(request.method, 'Use pay to record payment.')

    def destroy(self, request, *args, **kwargs):
        raise MethodNotAllowed('DELETE', 'Bills are retained for accounting.')

    @action(detail=True, methods=['patch'])
    @transaction.atomic
    def pay(self, request, pk=None):
        """Mark a bill as paid."""
        bill = get_object_or_404(self.get_queryset().select_for_update(of=('self',)), pk=pk)
        serializer = BillPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if bill.payment_status == 'paid':
            if serializer.validated_data['payment_status'] != 'paid' or serializer.validated_data.get('payment_method', bill.payment_method) != bill.payment_method:
                raise ValidationError({'detail': 'A settled bill cannot be changed.'})
            return Response(BillSerializer(bill).data)
        if serializer.validated_data['payment_status'] == 'partial':
            raise ValidationError({'detail': 'Partial payment recording is not supported.'})
        bill.payment_status = serializer.validated_data['payment_status']
        if 'payment_method' in serializer.validated_data:
            bill.payment_method = serializer.validated_data['payment_method']
        bill.save(update_fields=['payment_status', 'payment_method', 'updated_at'])

        return Response(BillSerializer(bill).data)

    @action(detail=False, methods=['get'])
    def lookup(self, request):
        """
        Lookup unpaid orders by table or token for bill generation.
        GET /api/v1/bills/lookup/?table=<number> or ?token=<number>
        """
        restaurant = _get_user_restaurant(request.user)
        table_num = request.query_params.get('table')
        token_num = request.query_params.get('token')

        qs = Order.objects.filter(restaurant=restaurant).exclude(status='cancelled')

        if table_num:
            qs = qs.filter(table__number=_positive_param(request, 'table', 1, 1000000))
        elif token_num:
            qs = qs.filter(token__number=_positive_param(request, 'token', 1, 1000000), created_at__range=_get_today_range())
        else:
            return Response(
                {'detail': 'Provide table or token number.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Exclude orders that already have a paid bill
        qs = qs.filter(bills__isnull=True)

        return Response(OrderSerializer(qs, many=True).data)


# ===========================================================================
# Staff Management
# ===========================================================================

class StaffProfileViewSet(viewsets.ModelViewSet):
    serializer_class = StaffProfileSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        restaurant = _get_user_restaurant(self.request.user)
        if restaurant:
            return StaffProfile.objects.filter(restaurant=restaurant).select_related('user')
        return StaffProfile.objects.none()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create a new staff member (User + StaffProfile)."""
        serializer = StaffCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        restaurant = _get_user_restaurant(request.user)

        user = User.objects.create_user(
            username=data['username'],
            password=data['password'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            email=data.get('email', ''),
        )

        profile = StaffProfile.objects.create(
            user=user,
            restaurant=restaurant,
            role=data['role'],
            phone_number=data.get('phone_number', ''),
        )

        return Response(StaffProfileSerializer(profile).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        """Delete staff profile and associated user."""
        profile = self.get_object()
        if profile.user_id == request.user.pk or profile.user_id == profile.restaurant.owner_id:
            raise ValidationError({'detail': 'The restaurant owner or your own account cannot be deleted.'})
        user = profile.user
        profile.delete()
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ===========================================================================
# Analytics (Admin only)
# ===========================================================================

class AnalyticsViewSet(viewsets.ViewSet):
    """
    Analytics endpoints for the admin dashboard.
    All data is scoped to the authenticated admin's restaurant.
    """
    permission_classes = [IsAdmin]

    def _get_restaurant(self, request):
        return _get_user_restaurant(request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Overall summary: total orders, revenue, customers."""
        restaurant = self._get_restaurant(request)
        days = _positive_param(request, 'days', 30, 366)
        since = timezone.now() - timedelta(days=days)

        orders = Order.objects.filter(restaurant=restaurant, created_at__gte=since).exclude(status='cancelled')
        total_revenue = orders.aggregate(total=Sum('total_amount'))['total'] or 0
        total_orders = orders.count()
        total_customers = Customer.objects.filter(restaurant=restaurant, created_at__gte=since).count()

        return Response({
            'period_days': days,
            'total_orders': total_orders,
            'total_revenue': float(total_revenue),
            'total_customers': total_customers,
            'avg_order_value': float(total_revenue / total_orders) if total_orders else 0,
        })

    @action(detail=False, methods=['get'])
    def sales_by_day(self, request):
        """Daily sales for the last N days."""
        restaurant = self._get_restaurant(request)
        days = _positive_param(request, 'days', 30, 366)
        since = timezone.now() - timedelta(days=days)

        data = (
            Order.objects
            .filter(restaurant=restaurant, created_at__gte=since)
            .exclude(status='cancelled')
            .annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(
                total=Sum('total_amount'),
                count=Count('id'),
            )
            .order_by('date')
        )
        return Response(list(data))

    @action(detail=False, methods=['get'])
    def popular_items(self, request):
        """Top N most ordered items."""
        restaurant = self._get_restaurant(request)
        limit = _positive_param(request, 'limit', 10, 100)
        days = _positive_param(request, 'days', 30, 366)
        since = timezone.now() - timedelta(days=days)

        data = (
            OrderItem.objects
            .filter(
                order__restaurant=restaurant,
                order__created_at__gte=since,
            )
            .exclude(order__status='cancelled')
            .values(name=F('menu_item__name'))
            .annotate(
                total_ordered=Sum('quantity'),
                total_revenue=Sum('subtotal'),
            )
            .order_by('-total_ordered')[:limit]
        )
        return Response(list(data))

    @action(detail=False, methods=['get'])
    def peak_hours(self, request):
        """Orders by hour of day."""
        restaurant = self._get_restaurant(request)
        days = _positive_param(request, 'days', 30, 366)
        since = timezone.now() - timedelta(days=days)

        data = (
            Order.objects
            .filter(restaurant=restaurant, created_at__gte=since)
            .exclude(status='cancelled')
            .annotate(hour=TruncHour('created_at'))
            .values('hour')
            .annotate(count=Count('id'))
            .order_by('hour')
        )
        return Response(list(data))

    @action(detail=False, methods=['get'])
    def revenue_by_category(self, request):
        """Revenue broken down by menu category."""
        restaurant = self._get_restaurant(request)
        days = _positive_param(request, 'days', 30, 366)
        since = timezone.now() - timedelta(days=days)

        data = (
            OrderItem.objects
            .filter(
                order__restaurant=restaurant,
                order__created_at__gte=since,
            )
            .exclude(order__status='cancelled')
            .values(category=F('menu_item__category__name'))
            .annotate(
                total_revenue=Sum('subtotal'),
                total_items=Sum('quantity'),
            )
            .order_by('-total_revenue')
        )
        return Response(list(data))


# ===========================================================================
# Platform / Superadmin Management (All Restaurants Analysis & Credentials)
# ===========================================================================

class PlatformAdminViewSet(viewsets.ViewSet):
    """
    Platform-level administration for superusers and platform admins:
    - Analyze all registered restaurants, GMV, order volume, staff count
    - Master credential recovery / password reset for restaurant owners
    - Cross-platform aggregate telemetry
    """
    permission_classes = [IsSuperUserOrPlatformAdmin]

    @action(detail=False, methods=['get'])
    def restaurants(self, request):
        """List all restaurants on the platform with aggregated telemetry and owner details."""
        restaurants = Restaurant.objects.all().select_related('owner').order_by('-created_at')
        results = []
        for r in restaurants:
            total_orders = Order.objects.filter(restaurant=r).count()
            total_revenue = Bill.objects.filter(restaurant=r, payment_status='paid').aggregate(
                total=Sum('final_amount')
            )['total'] or 0
            staff_count = StaffProfile.objects.filter(restaurant=r).count()
            menu_count = MenuItem.objects.filter(category__restaurant=r).count()
            table_count = Table.objects.filter(restaurant=r).count()

            results.append({
                'id': str(r.id),
                'name': r.name,
                'slug': r.slug,
                'workflow_type': r.workflow_type,
                'currency': r.currency,
                'is_active': r.is_active,
                'created_at': r.created_at,
                'owner': {
                    'id': r.owner.id if r.owner else None,
                    'username': r.owner.username if r.owner else '',
                    'email': r.owner.email if r.owner else '',
                    'first_name': r.owner.first_name if r.owner else '',
                    'last_name': r.owner.last_name if r.owner else '',
                } if r.owner else None,
                'metrics': {
                    'total_orders': total_orders,
                    'total_revenue': float(total_revenue),
                    'staff_count': staff_count,
                    'menu_count': menu_count,
                    'table_count': table_count,
                }
            })
        return Response(results)

    @action(detail=True, methods=['post'])
    def reset_owner_password(self, request, pk=None):
        """
        Master credential assistance: resets the owner's password for a given restaurant.
        """
        try:
            restaurant = Restaurant.objects.select_related('owner').get(pk=pk)
        except Restaurant.DoesNotExist:
            return Response({'detail': 'Restaurant not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_password = request.data.get('new_password', '').strip()
        if not new_password or len(new_password) < 6:
            return Response(
                {'detail': 'New password must be at least 6 characters.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not restaurant.owner:
            return Response(
                {'detail': 'This restaurant does not have an assigned master owner user.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        restaurant.owner.set_password(new_password)
        restaurant.owner.save()

        ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', ''))
        if ip and ',' in ip:
            ip = ip.split(',')[0].strip()
        log_safety_event(
            'credential_reset',
            f"Master credentials for restaurant '{restaurant.name}' owner '{restaurant.owner.username}' reset by platform admin.",
            severity='warning',
            user=request.user,
            restaurant=restaurant,
            ip_address=ip
        )

        return Response({
            'detail': f"Password for master owner '{restaurant.owner.username}' of '{restaurant.name}' has been successfully updated.",
            'username': restaurant.owner.username,
            'email': restaurant.owner.email,
        })

    @action(detail=True, methods=['post'])
    def toggle_restaurant_status(self, request, pk=None):
        """Platform admin toggle active/suspended status for a restaurant tenant."""
        try:
            restaurant = Restaurant.objects.get(pk=pk)
        except Restaurant.DoesNotExist:
            return Response({'detail': 'Restaurant not found.'}, status=status.HTTP_404_NOT_FOUND)

        restaurant.is_active = not restaurant.is_active
        restaurant.save(update_fields=['is_active'])

        status_text = 'activated' if restaurant.is_active else 'suspended'
        ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', ''))
        if ip and ',' in ip:
            ip = ip.split(',')[0].strip()
        log_safety_event(
            'tenant_status_changed',
            f"Platform admin {status_text} restaurant '{restaurant.name}' (slug: {restaurant.slug}).",
            severity='warning',
            user=request.user,
            restaurant=restaurant,
            ip_address=ip
        )
        return Response({
            'detail': f"Restaurant '{restaurant.name}' has been {status_text}.",
            'is_active': restaurant.is_active,
        })

    @action(detail=False, methods=['get'])
    def users(self, request):
        """List all users registered across all tenants on the platform."""
        users = User.objects.all().select_related('staff_profile__restaurant').order_by('-date_joined')
        results = []
        for u in users:
            profile = getattr(u, 'staff_profile', None)
            results.append({
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'is_active': u.is_active,
                'is_superuser': u.is_superuser,
                'is_staff': u.is_staff,
                'date_joined': u.date_joined,
                'last_login': u.last_login,
                'role': profile.role if profile else ('superadmin' if u.is_superuser else 'none'),
                'restaurant': {
                    'id': str(profile.restaurant.id),
                    'name': profile.restaurant.name,
                    'slug': profile.restaurant.slug,
                } if profile and profile.restaurant else None,
            })
        return Response(results)

    @action(detail=False, methods=['post'])
    def reset_user_password(self, request):
        """Platform admin reset of any user account password."""
        user_id = request.data.get('user_id')
        new_password = request.data.get('new_password', '').strip()
        if not user_id or not new_password or len(new_password) < 6:
            return Response(
                {'detail': 'Valid user_id and new_password (min 6 chars) are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            target_user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        target_user.set_password(new_password)
        target_user.save()

        ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', ''))
        if ip and ',' in ip:
            ip = ip.split(',')[0].strip()
        log_safety_event(
            'credential_reset',
            f"Superadmin reset credentials for user '{target_user.username}'.",
            severity='warning',
            user=request.user,
            ip_address=ip
        )
        return Response({
            'detail': f"Password for user '{target_user.username}' has been successfully reset.",
            'username': target_user.username,
        })

    @action(detail=False, methods=['get'])
    def safety_logs(self, request):
        """List audit, authentication, and safety events across the platform."""
        severity_filter = request.query_params.get('severity')
        event_filter = request.query_params.get('event_type')
        search = request.query_params.get('search')

        qs = SafetyLog.objects.all().select_related('user', 'restaurant').order_by('-created_at')
        if severity_filter:
            qs = qs.filter(severity=severity_filter)
        if event_filter:
            qs = qs.filter(event_type=event_filter)
        if search:
            qs = qs.filter(description__icontains=search) | qs.filter(username__icontains=search)

        results = []
        for log in qs[:150]:
            results.append({
                'id': str(log.id),
                'event_type': log.event_type,
                'severity': log.severity,
                'username': log.username,
                'user_id': log.user.id if log.user else None,
                'restaurant_name': log.restaurant.name if log.restaurant else '',
                'restaurant_id': str(log.restaurant.id) if log.restaurant else None,
                'ip_address': log.ip_address,
                'description': log.description,
                'metadata': log.metadata,
                'created_at': log.created_at,
            })
        return Response(results)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Cross-platform macro analytics."""
        total_restaurants = Restaurant.objects.count()
        total_orders = Order.objects.count()
        total_gmv = Bill.objects.filter(payment_status='paid').aggregate(total=Sum('final_amount'))['total'] or 0
        total_staff = StaffProfile.objects.count()

        return Response({
            'total_restaurants': total_restaurants,
            'total_orders': total_orders,
            'total_gmv': float(total_gmv),
            'total_staff': total_staff,
        })
