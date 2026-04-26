import { supabase } from './supabase';
import type { Rol, Usuario } from '../types';

export async function loginAlumno(matricula: string, contrasena: string): Promise<void> {
  const email = `${matricula.toLowerCase().trim()}@tecnm.mx`;
  const { error } = await supabase.auth.signInWithPassword({ email, password: contrasena });
  if (error) throw error;
}

export async function loginAdmin(contrasena: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email: 'admin@tecnm.mx',
    password: contrasena,
  });
  if (error) throw error;
}

export async function registrarAlumno(
  nombre: string,
  matricula: string,
  rol: Rol,
  contrasena: string,
): Promise<void> {
  const email = `${matricula.toLowerCase().trim()}@tecnm.mx`;
  const { data, error } = await supabase.auth.signUp({ email, password: contrasena });
  if (error) throw error;
  if (!data.user) throw new Error('No se pudo crear el usuario');

  const { error: perfilError } = await supabase.from('perfiles').insert({
    id: data.user.id,
    nombre: nombre.trim(),
    matricula: matricula.toLowerCase().trim(),
    rol,
  });
  if (perfilError) throw perfilError;
}

export async function obtenerPerfil(userId: string): Promise<Usuario> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function cerrarSesionSupabase(): Promise<void> {
  await supabase.auth.signOut();
}
