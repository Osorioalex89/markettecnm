import { create } from 'zustand';
import {
  toggleFavorito as toggleFavoritoService,
  fetchFavoritos,
} from '../services/favoritosService';

interface FavoritosState {
  favoritos: Set<string>; // producto_ids
  cargando: boolean;
  cargarFavoritos: (compradorId: string) => Promise<void>;
  toggleFavorito: (compradorId: string, productoId: string) => Promise<void>;
  esFavorito: (productoId: string) => boolean;
}

export const useFavoritosStore = create<FavoritosState>((set, get) => ({
  favoritos: new Set<string>(),
  cargando: false,

  cargarFavoritos: async (compradorId: string) => {
    set({ cargando: true });
    try {
      const ids = await fetchFavoritos(compradorId);
      set({ favoritos: new Set(ids) });
    } catch {
      // silencioso — no bloquear la UI
    } finally {
      set({ cargando: false });
    }
  },

  toggleFavorito: async (compradorId: string, productoId: string) => {
    const prev = new Set(get().favoritos);
    const eraFavorito = prev.has(productoId);

    // Actualización optimista
    const siguiente = new Set(prev);
    if (eraFavorito) {
      siguiente.delete(productoId);
    } else {
      siguiente.add(productoId);
    }
    set({ favoritos: siguiente });

    try {
      await toggleFavoritoService(compradorId, productoId);
    } catch {
      // Revertir si falló
      set({ favoritos: prev });
    }
  },

  esFavorito: (productoId: string) => {
    return get().favoritos.has(productoId);
  },
}));
