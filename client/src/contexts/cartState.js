export function cartReducer(state = [], action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, quantity = 1, notes = '' } = action.payload;
      const existing = state.find((i) => i.id === item.id);
      if (existing) {
        return state.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [
        ...state,
        {
          id: item.id,
          name: item.name,
          price: parseFloat(item.price),
          image: item.image,
          quantity,
          notes,
          is_vegetarian: item.is_vegetarian,
          is_vegan: item.is_vegan,
        },
      ];
    }
    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) {
        return state.filter((i) => i.id !== itemId);
      }
      return state.map((i) => (i.id === itemId ? { ...i, quantity } : i));
    }
    case 'UPDATE_NOTES': {
      const { itemId, notes } = action.payload;
      return state.map((i) => (i.id === itemId ? { ...i, notes } : i));
    }
    case 'REMOVE_ITEM': {
      return state.filter((i) => i.id !== action.payload.itemId);
    }
    case 'CLEAR_CART': {
      return [];
    }
    default:
      return state;
  }
}

export function calculateTotals(items) {
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return { totalItems, totalAmount };
}

