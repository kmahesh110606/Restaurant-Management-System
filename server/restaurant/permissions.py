"""
Role-based permissions for the Restaurant Management System.

All permissions check that the authenticated user has a StaffProfile
and that the profile's restaurant matches the resource being accessed.
"""  # Module docstring defining custom Django REST Framework permission classes

from rest_framework.permissions import BasePermission, SAFE_METHODS  # Import DRF BasePermission and SAFE_METHODS list (GET, HEAD, OPTIONS)


class _HasRole(BasePermission):  # Base permission class for checking user roles
    """Base class — checks user has an active staff profile with a given role."""  # Class docstring

    required_roles = []  # List of allowed roles to be overridden in subclasses

    def has_permission(self, request, view):  # Check request permission method
        if not request.user or not request.user.is_authenticated:  # Verify that user object exists and is authenticated
            return False  # Deny permission if user is anonymous or unauthenticated
        profile = getattr(request.user, 'staff_profile', None)  # Retrieve staff_profile attribute from user object safely
        if profile is None or not profile.is_active:  # Check if profile exists and is active
            return False  # Deny permission if profile is missing or inactive
        return profile.role in self.required_roles  # Grant permission if staff profile role is listed in required_roles


class IsAdmin(_HasRole):  # Permission class restricting access to Admin users
    required_roles = ['admin']  # Set allowed role to 'admin'


class IsWaiter(_HasRole):  # Permission class restricting access to Waiter staff
    required_roles = ['waiter']  # Set allowed role to 'waiter'


class IsKitchen(_HasRole):  # Permission class restricting access to Kitchen staff
    required_roles = ['kitchen']  # Set allowed role to 'kitchen'


class IsBiller(_HasRole):  # Permission class restricting access to Biller staff
    required_roles = ['biller']  # Set allowed role to 'biller'


class IsStaff(_HasRole):  # Permission class allowing access to any active staff member
    """Any authenticated staff member."""  # Docstring for IsStaff
    required_roles = ['admin', 'waiter', 'kitchen', 'biller']  # Allow all valid staff roles


class IsAdminOrReadOnly(BasePermission):  # Permission class for read-only public access or admin full access
    """
    Admin gets full access; everyone else (including unauthenticated) gets
    read-only access. Used for public-facing endpoints like the menu.
    """  # Docstring explaining public read / admin write policy

    def has_permission(self, request, view):  # Check request permission method
        if request.method in SAFE_METHODS:  # Check if HTTP request method is safe (GET, HEAD, OPTIONS)
            return True  # Allow read-only access for any requester
        if not request.user or not request.user.is_authenticated:  # Verify authentication for write operations
            return False  # Deny write requests from unauthenticated users
        profile = getattr(request.user, 'staff_profile', None)  # Retrieve staff profile from request user
        return profile is not None and profile.role == 'admin'  # Allow write access only if user is an admin


class IsAdminOrKitchen(BasePermission):  # Permission class allowing access to Admin or Kitchen staff
    """Admin or Kitchen staff."""  # Docstring for IsAdminOrKitchen

    def has_permission(self, request, view):  # Check request permission method
        if not request.user or not request.user.is_authenticated:  # Verify user is authenticated
            return False  # Deny permission if not authenticated
        profile = getattr(request.user, 'staff_profile', None)  # Fetch staff profile attribute
        if profile is None or not profile.is_active:  # Check if profile is active
            return False  # Deny access if profile missing or inactive
        return profile.role in ('admin', 'kitchen')  # Allow access if role is admin or kitchen


class IsBillerOrAdmin(BasePermission):  # Permission class allowing access to Biller or Admin staff
    """Biller or Admin staff."""  # Docstring for IsBillerOrAdmin

    def has_permission(self, request, view):  # Check request permission method
        if not request.user or not request.user.is_authenticated:  # Verify user is authenticated
            return False  # Deny permission if not authenticated
        profile = getattr(request.user, 'staff_profile', None)  # Fetch staff profile attribute
        if profile is None or not profile.is_active:  # Check if profile is active
            return False  # Deny access if profile missing or inactive
        return profile.role in ('admin', 'biller')  # Allow access if role is admin or biller

