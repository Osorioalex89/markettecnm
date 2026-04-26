import { create } from 'zustand';
import type { Producto } from '../types';

export type CartItem = {
  producto: Producto;
  cantidad: number;
};

interface CarritoState {
  items: CartItem[];
  agregarItem: (producto: Producto) => void;
  decrementarItem: (productoId: string) => void;
  quitarItem: (productoId: string) => void;
  limpiarCarrito: () => void;
  total: () => number;
}

export const useCarritoStore = create<CarritoState>((set, get) => ({
  items: [],

  agregarItem: (producto) => {
    const items = get().items;
    const existente = items.find((i) => i.producto.id === producto.id);
    if (existente) {
      set({
        items: items.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i,
        ),
      });
    } else {
      set({ items: [...items, { producto, cantidad: 1 }] });
    }
  },

  decrementarItem: (productoId) => {
    const items = get().items;
    const item = items.find((i) => i.producto.id === productoId);
    if (!item) return;
    if (item.cantidad <= 1) {
      set({ items: items.filter((i) => i.producto.id !== productoId) });
    } else {
      set({
        items: items.map((i) =>
          i.producto.id === productoId ? { ...i, cantidad: i.cantidad - 1 } : i,
        ),
      });
    }
  },

  quitarItem: (productoId) =>
    set({ items: get().items.filter((i) => i.producto.id !== productoId) }),

  limpiarCarrito: () => set({ items: [] }),

  total: () =>
    get().items.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0),
}));