"""
Django admin registrations for the Restaurant Management System.
"""

from django.contrib import admin
from restaurant.models import (
    Restaurant, Category, MenuItem, MenuTranslation, Recipe,
    Table, Token, Customer, Order, OrderItem, Bill, StaffProfile,
)


# ---------------------------------------------------------------------------
# Inlines
# ---------------------------------------------------------------------------

class MenuItemInline(admin.TabularInline):
    model = MenuItem
    extra = 0
    fields = ['name', 'price', 'is_available', 'is_vegetarian', 'spice_level']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['subtotal']


class MenuTranslationInline(admin.TabularInline):
    model = MenuTranslation
    extra = 0


# ---------------------------------------------------------------------------
# Model Admins
# ---------------------------------------------------------------------------

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'workflow_type', 'is_active', 'owner']
    list_filter = ['workflow_type', 'is_active']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'restaurant', 'display_order', 'is_active']
    list_filter = ['restaurant', 'is_active']
    inlines = [MenuItemInline]


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'is_available', 'is_vegetarian']
    list_filter = ['category__restaurant', 'is_available', 'is_vegetarian', 'is_vegan']
    search_fields = ['name', 'description']
    inlines = [MenuTranslationInline]


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ['menu_item', 'prep_time_minutes', 'cook_time_minutes', 'serves']
    search_fields = ['menu_item__name']


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ['number', 'name', 'restaurant', 'capacity', 'is_active']
    list_filter = ['restaurant', 'is_active']


@admin.register(Token)
class TokenAdmin(admin.ModelAdmin):
    list_display = ['number', 'restaurant', 'status', 'created_at']
    list_filter = ['restaurant', 'status']


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['phone_number', 'name', 'restaurant', 'loyalty_points']
    search_fields = ['phone_number', 'name']
    list_filter = ['restaurant']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'restaurant', 'order_type', 'status', 'total_amount', 'created_at']
    list_filter = ['restaurant', 'order_type', 'status']
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'menu_item', 'quantity', 'unit_price', 'subtotal']


@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):
    list_display = ['id', 'restaurant', 'final_amount', 'payment_status', 'created_at']
    list_filter = ['restaurant', 'payment_status']


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'restaurant', 'role', 'is_active']
    list_filter = ['restaurant', 'role', 'is_active']
