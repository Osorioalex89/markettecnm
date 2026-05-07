import { supabase } from './supabase';
import type { Perfil, Producto } from '../types';

export type AdminStats = {
  totalUsuarios: number;
  totalProductos: number;
  ordenesHoy: number;
};

export type ProductoAdmin = Producto & { vendedor_nombre: string };

export async function fetchAdminStats(): Promise<AdminStats> {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const [{ count: usuarios }, { count: productos }, { count: ordenesHoy }] = await Promise.all([
    supabase.from('perfiles').select('*', { count: 'exact', head: true }).neq('rol', 'admin'),
    supabase.from('productos').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase
      .from('ordenes')
      .select('*', { count: 'exact', head: true })
      .gte('creado_en', hoy.toISOString()),
  ]);

  return {
    totalUsuarios: usuarios ?? 0,
    totalProductos: productos ?? 0,
    ordenesHoy: ordenesHoy ?? 0,
  };
}

export async function fetchTodosUsuarios(): Promise<Perfil[]> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .neq('rol', 'admin')
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function cambiarRolUsuario(
  userId: string,
  nuevoRol: 'comprador' | 'vendedor',
): Promise<void> {
  const { error } = await supabase
    .from('perfiles')
    .update({ rol: nuevoRol })
    .eq('id', userId);
  if (error) throw error;
}

export async function fetchTodosProductos(): Promise<ProductoAdmin[]> {
  const { data, error } = await supabase
    .from('productos')
    .select('*, perfiles(nombre)')
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p: any) => ({
    ...p,
    vendedor_nombre: p.perfiles?.nombre ?? 'Desconocido',
  }));
}

export async function toggleProductoActivo(
  productoId: string,
  activo: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('productos')
    .update({ activo })
    .eq('id', productoId);
  if (error) throw error;
}

export async function eliminarProducto(productoId: string): Promise<void> {
  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id', productoId);
  if (error) throw error;
}

export async function eliminarCuenta(userId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('eliminar-cuenta', {
    body: { userId },
  });
  if (error) throw error;
}
