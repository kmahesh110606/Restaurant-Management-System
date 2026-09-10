"""
URL configuration for the restaurant app.
Uses DRF's DefaultRouter for ViewSets + manual paths for auth and analytics.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from restaurant.views import (
    RestaurantViewSet, CategoryViewSet, MenuItemViewSet,
    MenuTranslationViewSet, RecipeViewSet,
    TableViewSet, TokenViewSet, CustomerViewSet,
    OrderViewSet, BillViewSet,
    StaffProfileViewSet, AnalyticsViewSet,
    staff_login, staff_me, google_login, restaurant_signup,
)

router = DefaultRouter()
router.register(r'restaurants', RestaurantViewSet, basename='restaurant')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'menu-items', MenuItemViewSet, basename='menuitem')
router.register(r'translations', MenuTranslationViewSet, basename='translation')
router.register(r'recipes', RecipeViewSet, basename='recipe')
router.register(r'tables', TableViewSet, basename='table')
router.register(r'tokens', TokenViewSet, basename='token')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'bills', BillViewSet, basename='bill')
router.register(r'staff', StaffProfileViewSet, basename='staff')
router.register(r'analytics', AnalyticsViewSet, basename='analytics')

urlpatterns = [
    # Auth
    path('auth/login/', staff_login, name='staff-login'),
    path('auth/me/', staff_me, name='staff-me'),
    path('auth/google/', google_login, name='google-login'),
    path('auth/signup/', restaurant_signup, name='restaurant-signup'),

    # Router URLs
    path('', include(router.urls)),
]
