"""
URL configuration for the restaurant app.
Uses DRF's DefaultRouter for ViewSets + manual paths for auth and analytics.
"""  # Module docstring explaining API URL routing setup using Django REST Framework router

from django.urls import path, include  # Import URL pattern defining function path and include helper
from rest_framework.routers import DefaultRouter  # Import REST framework router for automatically generating CRUD routes for ViewSets

<<<<<<< HEAD
from restaurant.views import (
    RestaurantViewSet, CategoryViewSet, MenuItemViewSet,
    MenuTranslationViewSet, RecipeViewSet,
    TableViewSet, TokenViewSet, CustomerViewSet,
    OrderViewSet, BillViewSet,
    StaffProfileViewSet, AnalyticsViewSet,
    staff_login, staff_me, google_login, restaurant_signup,
)
=======
from restaurant.views import (  # Import viewsets and function views from restaurant.views
    RestaurantViewSet, CategoryViewSet, MenuItemViewSet,  # Import Restaurant, Category, and MenuItem viewsets
    MenuTranslationViewSet, RecipeViewSet,  # Import MenuTranslation and Recipe viewsets
    TableViewSet, TokenViewSet, CustomerViewSet,  # Import Table, Token, and Customer viewsets
    OrderViewSet, BillViewSet,  # Import Order and Bill viewsets
    StaffProfileViewSet, AnalyticsViewSet,  # Import StaffProfile and Analytics viewsets
    staff_login, staff_me,  # Import staff login and current staff member detail function views
)  # Close import block
>>>>>>> b7ce8a3aaab13c0af968bde073b6b78f5ae8efd3

router = DefaultRouter()  # Create an instance of DRF DefaultRouter to handle REST API endpoint registration
router.register(r'restaurants', RestaurantViewSet, basename='restaurant')  # Register REST endpoints for managing restaurants at /restaurants/
router.register(r'categories', CategoryViewSet, basename='category')  # Register REST endpoints for managing menu categories at /categories/
router.register(r'menu-items', MenuItemViewSet, basename='menuitem')  # Register REST endpoints for managing menu items at /menu-items/
router.register(r'translations', MenuTranslationViewSet, basename='translation')  # Register REST endpoints for menu translations at /translations/
router.register(r'recipes', RecipeViewSet, basename='recipe')  # Register REST endpoints for menu item recipe ingredients at /recipes/
router.register(r'tables', TableViewSet, basename='table')  # Register REST endpoints for managing dining tables at /tables/
router.register(r'tokens', TokenViewSet, basename='token')  # Register REST endpoints for dining table tokens at /tokens/
router.register(r'customers', CustomerViewSet, basename='customer')  # Register REST endpoints for managing customers at /customers/
router.register(r'orders', OrderViewSet, basename='order')  # Register REST endpoints for customer orders at /orders/
router.register(r'bills', BillViewSet, basename='bill')  # Register REST endpoints for order bills and payments at /bills/
router.register(r'staff', StaffProfileViewSet, basename='staff')  # Register REST endpoints for managing staff profiles at /staff/
router.register(r'analytics', AnalyticsViewSet, basename='analytics')  # Register REST endpoints for analytics and reports at /analytics/

urlpatterns = [  # Define array of API URL routes
    # Auth
<<<<<<< HEAD
    path('auth/login/', staff_login, name='staff-login'),
    path('auth/me/', staff_me, name='staff-me'),
    path('auth/google/', google_login, name='google-login'),
    path('auth/signup/', restaurant_signup, name='restaurant-signup'),

    # Router URLs
    path('', include(router.urls)),
]
=======
    path('auth/login/', staff_login, name='staff-login'),  # Map POST /auth/login/ to staff_login function view
    path('auth/me/', staff_me, name='staff-me'),  # Map GET /auth/me/ to staff_me function view

    # Router URLs
    path('', include(router.urls)),  # Include all automatically generated ViewSet routes from router
]  # End of urlpatterns array
>>>>>>> b7ce8a3aaab13c0af968bde073b6b78f5ae8efd3

