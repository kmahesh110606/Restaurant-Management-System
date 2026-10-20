import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from django.contrib.auth.models import User
from restaurant.models import Restaurant, StaffProfile, Category, MenuItem, Table
from decimal import Decimal

def seed():
    # 1. Superuser / Admin
    user, created = User.objects.get_or_create(username='admin', defaults={'email': 'admin@example.com'})
    user.set_password('admin123')
    user.is_staff = True
    user.is_superuser = True
    user.save()
    print("User 'admin' configured with password 'admin123'")

    # 2. Restaurant
    restaurant, created = Restaurant.objects.get_or_create(
        slug='gourmet-bistro',
        defaults={
            'name': 'Gourmet Bistro',
            'owner': user,
            'workflow_type': 'table',
            'tax_rate': Decimal('5.00'),
            'currency': 'INR',
            'description': 'Modern culinary dining experience',
            'phone': '+91 9876543210',
            'address': '123 Fine Dining Avenue, Tech City',
        }
    )
    print(f"Restaurant '{restaurant.name}' ({restaurant.slug}) ready.")

    # 3. Staff Profile
    staff, _ = StaffProfile.objects.get_or_create(
        user=user,
        defaults={'restaurant': restaurant, 'role': 'admin'}
    )
    staff.restaurant = restaurant
    staff.role = 'admin'
    staff.save()
    print("Staff profile linked.")

    # 4. Tables
    for num in range(1, 6):
        Table.objects.get_or_create(
            restaurant=restaurant,
            number=num,
            defaults={'capacity': 4, 'name': f'Table {num}'}
        )
    print("5 Tables created.")

    # 5. Categories & Menu Items
    cat_starters, _ = Category.objects.get_or_create(
        restaurant=restaurant, name='Starters', defaults={'display_order': 1}
    )
    cat_mains, _ = Category.objects.get_or_create(
        restaurant=restaurant, name='Main Course', defaults={'display_order': 2}
    )
    cat_drinks, _ = Category.objects.get_or_create(
        restaurant=restaurant, name='Beverages', defaults={'display_order': 3}
    )
    cat_desserts, _ = Category.objects.get_or_create(
        restaurant=restaurant, name='Desserts', defaults={'display_order': 4}
    )

    items = [
        (cat_starters, 'Crispy Truffle Fries', 'Hand-cut fries with parmesan & black truffle oil', '249.00', True, 0),
        (cat_starters, 'Paneer Tikka Skewers', 'Cottage cheese marinated in aromatic tandoori spices', '320.00', True, 2),
        (cat_starters, 'Fiery Chicken Wings', 'Crispy wings tossed in house smoky hot sauce', '380.00', False, 3),
        (cat_mains, 'Classic Margherita Pizza', 'San Marzano tomatoes, fresh mozzarella, basil', '450.00', True, 0),
        (cat_mains, 'Butter Chicken with Naan', 'Tender chicken in rich buttery tomato gravy', '520.00', False, 1),
        (cat_mains, 'Wild Mushroom Risotto', 'Arborio rice, porcini mushrooms, parmesan crisp', '480.00', True, 0),
        (cat_drinks, 'Mint Basil Mojito', 'Fresh mint, sweet lime, crushed ice, sparkling soda', '180.00', True, 0),
        (cat_drinks, 'Iced Hazelnut Latte', 'Espresso shot with chilled milk & hazelnut syrup', '210.00', True, 0),
        (cat_desserts, 'Belgian Chocolate Lava Cake', 'Warm molten chocolate cake with vanilla bean gelato', '290.00', True, 0),
        (cat_desserts, 'New York Cheesecake', 'Rich cream cheese cake topped with blueberry compote', '310.00', True, 0),
    ]

    for cat, name, desc, price, is_veg, spice in items:
        MenuItem.objects.get_or_create(
            category=cat,
            name=name,
            defaults={
                'description': desc,
                'price': Decimal(price),
                'is_vegetarian': is_veg,
                'spice_level': spice,
                'is_available': True,
                'preparation_time': 15,
            }
        )
    print("Demo menu items created.")

if __name__ == '__main__':
    seed()
