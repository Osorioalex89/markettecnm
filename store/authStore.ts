import { create } from 'zustand';
import type { Rol, Usuario } from '../types';
import {
  loginAlumno,
  loginAdmin,
  registrarAlumno,
  cerrarSesionSupabase,
} from '../services/authService';

interface AuthState {
  usuario: Usuario | null;
  sesionCargando: boolean;
  setUsuario: (usuario: Usuario | null) => void;
  setSesionCargando: (cargando: boolean) => void;
  login: (matricula: string, contrasena: string) => Promise<void>;
  loginComoAdmin: (contrasena: string) => Promise<void>;
  registro: (nombre: string, matricula: string, rol: Rol, contrasena: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  sesionCargando: true,

  setUsuario: (usuario) => set({ usuario }),
  setSesionCargando: (sesionCargando) => set({ sesionCargando }),

  login: async (matricula, contrasena) => {
    await loginAlumno(matricula, contrasena);
  },

  loginComoAdmin: async (contrasena) => {
    await loginAdmin(contrasena);
  },

  registro: async (nombre, matricula, rol, contrasena) => {
    await registrarAlumno(nombre, matricula, rol, contrasena);
  },

  cerrarSesion: async () => {
    await cerrarSesionSupabase();
    set({ usuario: null });
  },
}));
