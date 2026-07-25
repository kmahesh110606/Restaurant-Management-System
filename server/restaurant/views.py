"""
DRF ViewSets and API views for the Restaurant Management System.

Multi-tenant: All querysets are filtered by the authenticated user's
restaurant (for staff endpoints) or by the restaurant slug in the URL
(for public/customer endpoints).
"""

from datetime import timedelta

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
)
from restaurant.serializers import (
    RestaurantSerializer, RestaurantPublicSerializer,
    CategorySerializer, CategoryListSerializer,
    MenuItemSerializer, MenuItemWriteSerializer,
    MenuTranslationSerializer, RecipeSerializer,
    TableSerializer, TokenSerializer,
    CustomerSerializer,
    OrderSerializer, OrderCreateSerializer, OrderStatusUpdateSerializer,
    OrderItemSerializer,
    BillSerializer, BillCreateSerializer, BillPaymentSerializer,
    StaffProfileSerializer, StaffCreateSerializer,
    LoginSerializer,
)
from restaurant.permissions import (
    IsAdmin, IsStaff, IsAdminOrReadOnly, IsAdminOrKitchen, IsBillerOrAdmin,
)
from restaurant.utils import generate_qr_code, get_next_token_number


# ===========================================================================
# Helper: get restaurant from authenticated user
# ===========================================================================

def _get_user_restaurant(user):
    """Return the restaurant that the authenticated staff user belongs to."""
    profile = getattr(user, 'staff_profile', None)
    if profile:
        return profile.restaurant
    return None


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
    if user is None:
        return Response(
            {'detail': 'Invalid credentials.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    profile = getattr(user, 'staff_profile', None)
    if profile is None or not profile.is_active:
        return Response(
            {'detail': 'No active staff profile for this user.'},
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


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def staff_me(request):
    """Return the currently authenticated staff user's profile."""
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
        },
        'role': profile.role,
        'restaurant': RestaurantSerializer(profile.restaurant).data,
    })


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
        if self.request.user.is_authenticated:
            restaurant = _get_user_restaurant(self.request.user)
            if restaurant:
                return Restaurant.objects.filter(pk=restaurant.pk)
        return Restaurant.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.action in ('list', 'retrieve') and not self.request.user.is_authenticated:
            return RestaurantPublicSerializer
        return RestaurantSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def public(self, request, slug=None):
        """Public endpoint to get restaurant info by slug."""
        restaurant = self.get_object()
        return Response(RestaurantPublicSerializer(restaurant).data)


# ===========================================================================
# Category
# ===========================================================================

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
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

    def get_queryset(self):
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

    def get_queryset(self):
        restaurant = _get_user_restaurant(self.request.user)
        if restaurant:
            return Table.objects.filter(restaurant=restaurant)
        return Table.objects.none()

    def perform_create(self, serializer):
        restaurant = _get_user_restaurant(self.request.user)
        serializer.save(restaurant=restaurant)

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
                qs = qs.filter(created_at__date=timezone.now().date())
            return qs
        return Token.objects.none()

    def perform_create(self, serializer):
        restaurant = _get_user_restaurant(self.request.user)
        next_number = get_next_token_number(restaurant)
        serializer.save(restaurant=restaurant, number=next_number)


# ===========================================================================
# Customer
# ===========================================================================

class CustomerViewSet(viewsets.ModelViewSet):
    serializer_class = CustomerSerializer
    permission_classes = [IsStaff]

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
        if self.action in ('track',):
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
                    qs = qs.filter(created_at__date=timezone.now().date())
                return qs
        return Order.objects.none()

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
            restaurant = Restaurant.objects.get(slug=data['restaurant_slug'], is_active=True)
        except Restaurant.DoesNotExist:
            return Response(
                {'detail': 'Restaurant not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

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
                return Response(
                    {'detail': f"Table {data['table_number']} not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
        elif order_type == 'token':
            next_num = get_next_token_number(restaurant)
            token_obj = Token.objects.create(restaurant=restaurant, number=next_num)

        # Create order
        order = Order.objects.create(
            restaurant=restaurant,
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
                )
            except MenuItem.DoesNotExist:
                order.delete()  # Rollback
                return Response(
                    {'detail': f"Menu item {item_data['menu_item']} not available."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

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

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Staff endpoint to update order status."""
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order.status = serializer.validated_data['status']
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
            order = Order.objects.select_related('table', 'token', 'customer').prefetch_related(
                'items__menu_item'
            ).get(pk=order_id)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(OrderSerializer(order).data)

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

        orders = Order.objects.filter(
            restaurant__slug=slug,
            table__number=table_num,
            customer__phone_number=phone,
        ).exclude(
            status__in=['cancelled']
        ).exclude(
            bills__payment_status='paid',
        ).select_related('table', 'token', 'customer').prefetch_related('items__menu_item')

        return Response(OrderSerializer(orders, many=True).data)


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
                qs = qs.filter(created_at__date=timezone.now().date())
            return qs
        return Bill.objects.none()

    def create(self, request, *args, **kwargs):
        """Create a bill from one or more order IDs."""
        serializer = BillCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        restaurant = _get_user_restaurant(request.user)
        orders = Order.objects.filter(
            pk__in=data['order_ids'],
            restaurant=restaurant,
        )
        if orders.count() != len(data['order_ids']):
            return Response(
                {'detail': 'One or more orders not found.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

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

    @action(detail=True, methods=['patch'])
    def pay(self, request, pk=None):
        """Mark a bill as paid."""
        bill = self.get_object()
        serializer = BillPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        bill.payment_status = serializer.validated_data['payment_status']
        if 'payment_method' in serializer.validated_data:
            bill.payment_method = serializer.validated_data['payment_method']
        bill.save(update_fields=['payment_status', 'payment_method', 'updated_at'])

        # If paid, mark all linked orders as served
        if bill.payment_status == 'paid':
            bill.orders.exclude(status='cancelled').update(status='served')

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
            qs = qs.filter(table__number=table_num)
        elif token_num:
            qs = qs.filter(token__number=token_num, created_at__date=timezone.now().date())
        else:
            return Response(
                {'detail': 'Provide table or token number.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Exclude orders that already have a paid bill
        qs = qs.exclude(bills__payment_status='paid')

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
        days = int(request.query_params.get('days', 30))
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
        days = int(request.query_params.get('days', 30))
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
        limit = int(request.query_params.get('limit', 10))
        days = int(request.query_params.get('days', 30))
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
        days = int(request.query_params.get('days', 30))
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
        days = int(request.query_params.get('days', 30))
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
