import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  items: [],

  addItem: (product, qty = 1) => {
    const items = get().items;
    const found = items.find((i) => i.id === product.id);
    set({
      items: found
        ? items.map((i) => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
        : [...items, { ...product, qty }],
    });
  },

  removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

  updateQty: (id, qty) => {
    if (qty <= 0) { get().removeItem(id); return; }
    set({ items: get().items.map((i) => (i.id === id ? { ...i, qty } : i)) });
  },

  clearCart: () => set({ items: [] }),

  get total()     { return get().items.reduce((s, i) => s + i.price * i.qty, 0); },
  get itemCount() { return get().items.reduce((s, i) => s + i.qty, 0); },
}));
