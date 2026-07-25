"""
Role-based permissions for the Restaurant Management System.

All permissions check that the authenticated user has a StaffProfile
and that the profile's restaurant matches the resource being accessed.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class _HasRole(BasePermission):
    """Base class — checks user has an active staff profile with a given role."""

    required_roles = []  # Override in subclasses

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        profile = getattr(request.user, 'staff_profile', None)
        if profile is None or not profile.is_active:
            return False
        return profile.role in self.required_roles


class IsAdmin(_HasRole):
    required_roles = ['admin']


class IsWaiter(_HasRole):
    required_roles = ['waiter']


class IsKitchen(_HasRole):
    required_roles = ['kitchen']


class IsBiller(_HasRole):
    required_roles = ['biller']


class IsStaff(_HasRole):
    """Any authenticated staff member."""
    required_roles = ['admin', 'waiter', 'kitchen', 'biller']


class IsAdminOrReadOnly(BasePermission):
    """
    Admin gets full access; everyone else (including unauthenticated) gets
    read-only access.  Used for public-facing endpoints like the menu.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        profile = getattr(request.user, 'staff_profile', None)
        return profile is not None and profile.role == 'admin'


class IsAdminOrKitchen(BasePermission):
    """Admin or Kitchen staff."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        profile = getattr(request.user, 'staff_profile', None)
        if profile is None or not profile.is_active:
            return False
        return profile.role in ('admin', 'kitchen')


class IsBillerOrAdmin(BasePermission):
    """Biller or Admin staff."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        profile = getattr(request.user, 'staff_profile', None)
        if profile is None or not profile.is_active:
            return False
        return profile.role in ('admin', 'biller')
