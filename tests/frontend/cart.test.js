import { describe, it, expect } from 'vitest';
import { cartReducer, calculateTotals } from '../../client/src/contexts/cartState';

describe('Cart Business Logic Unit Tests', () => {
  it('starts with an empty cart', () => {
    const state = [];
    const totals = calculateTotals(state);
    expect(totals.totalItems).toBe(0);
    expect(totals.totalAmount).toBe(0);
  });

  it('adds a new item to cart and calculates totals correctly', () => {
    const item = { id: 1, name: 'Truffle Pasta', price: '450.00', is_vegetarian: true };
    const state = cartReducer([], { type: 'ADD_ITEM', payload: { item, quantity: 2 } });

    expect(state).toHaveLength(1);
    expect(state[0].name).toBe('Truffle Pasta');
    expect(state[0].quantity).toBe(2);
    expect(state[0].price).toBe(450);

    const totals = calculateTotals(state);
    expect(totals.totalItems).toBe(2);
    expect(totals.totalAmount).toBe(900);
  });

  it('increments quantity when adding the same item again', () => {
    const item = { id: 1, name: 'Truffle Pasta', price: '450.00', is_vegetarian: true };
    let state = cartReducer([], { type: 'ADD_ITEM', payload: { item, quantity: 1 } });
    state = cartReducer(state, { type: 'ADD_ITEM', payload: { item, quantity: 3 } });

    expect(state).toHaveLength(1);
    expect(state[0].quantity).toBe(4);

    const totals = calculateTotals(state);
    expect(totals.totalItems).toBe(4);
    expect(totals.totalAmount).toBe(1800);
  });

  it('handles multiple distinct items', () => {
    const item1 = { id: 1, name: 'Burger', price: '250.00' };
    const item2 = { id: 2, name: 'Fries', price: '100.00' };

    let state = cartReducer([], { type: 'ADD_ITEM', payload: { item: item1, quantity: 2 } });
    state = cartReducer(state, { type: 'ADD_ITEM', payload: { item: item2, quantity: 1 } });

    expect(state).toHaveLength(2);
    const totals = calculateTotals(state);
    expect(totals.totalItems).toBe(3);
    expect(totals.totalAmount).toBe(600);
  });

  it('updates quantity and drops item when quantity reaches zero', () => {
    const item = { id: 1, name: 'Espresso', price: '150.00' };
    let state = cartReducer([], { type: 'ADD_ITEM', payload: { item, quantity: 2 } });

    state = cartReducer(state, { type: 'UPDATE_QUANTITY', payload: { itemId: 1, quantity: 5 } });
    expect(state[0].quantity).toBe(5);

    state = cartReducer(state, { type: 'UPDATE_QUANTITY', payload: { itemId: 1, quantity: 0 } });
    expect(state).toHaveLength(0);
    expect(calculateTotals(state).totalItems).toBe(0);
  });

  it('updates special cooking notes for an item', () => {
    const item = { id: 1, name: 'Pizza', price: '500.00' };
    let state = cartReducer([], { type: 'ADD_ITEM', payload: { item, quantity: 1 } });

    state = cartReducer(state, {
      type: 'UPDATE_NOTES',
      payload: { itemId: 1, notes: 'Extra crispy crust, light cheese' },
    });
    expect(state[0].notes).toBe('Extra crispy crust, light cheese');
  });

  it('removes item by id directly', () => {
    const item1 = { id: 1, name: 'Coffee', price: '120.00' };
    const item2 = { id: 2, name: 'Croissant', price: '180.00' };

    let state = cartReducer([], { type: 'ADD_ITEM', payload: { item: item1, quantity: 1 } });
    state = cartReducer(state, { type: 'ADD_ITEM', payload: { item: item2, quantity: 1 } });

    state = cartReducer(state, { type: 'REMOVE_ITEM', payload: { itemId: 1 } });
    expect(state).toHaveLength(1);
    expect(state[0].id).toBe(2);
  });

  it('clears all items in cart', () => {
    const item = { id: 1, name: 'Salad', price: '300.00' };
    let state = cartReducer([], { type: 'ADD_ITEM', payload: { item, quantity: 3 } });
    expect(state).toHaveLength(1);

    state = cartReducer(state, { type: 'CLEAR_CART' });
    expect(state).toHaveLength(0);
    expect(calculateTotals(state).totalAmount).toBe(0);
  });
});
