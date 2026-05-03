import { create } from 'zustand';

export type TipoBanner = 'mensaje' | 'venta' | 'info' | 'error';

interface BannerState {
  visible: boolean;
  mensaje: string;
  tipo: TipoBanner;
  mostrarBanner: (mensaje: string, tipo?: TipoBanner) => void;
  ocultarBanner: () => void;
}

let timeoutId: ReturnType<typeof setTimeout> | null = null;

export const useBannerStore = create<BannerState>((set) => ({
  visible: false,
  mensaje: '',
  tipo: 'info',

  mostrarBanner: (mensaje, tipo = 'info') => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    set({ visible: true, mensaje, tipo });

    timeoutId = setTimeout(() => {
      set({ visible: false });
      timeoutId = null;
    }, 3500);
  },

  ocultarBanner: () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    set({ visible: false });
  },
}));
