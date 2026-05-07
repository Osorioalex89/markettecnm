import { supabase } from './supabase';

export type Calificacion = {
  id: string;
  comprador_id: string;
  vendedor_id: string;
  producto_id: string;
  orden_id: string;
  puntuacion: number;
  comentario: string | null;
  creado_en: string;
  perfiles?: { nombre: string } | null;
};

export type RatingResumen = {
  promedio: number;
  total: number;
};

export async function crearCalificacion(params: {
  compradorId: string;
  vendedorId: string;
  productoId: string;
  ordenId: string;
  puntuacion: number;
  comentario?: string;
}): Promise<void> {
  const { error } = await supabase.from('calificaciones').insert({
    comprador_id: params.compradorId,
    vendedor_id: params.vendedorId,
    producto_id: params.productoId,
    orden_id: params.ordenId,
    puntuacion: params.puntuacion,
    comentario: params.comentario ?? null,
  });
  if (error) throw error;
}

export async function fetchCalificacionesProducto(productoId: string): Promise<Calificacion[]> {
  const { data, error } = await supabase
    .from('calificaciones')
    .select('*, perfiles(nombre)')
    .eq('producto_id', productoId)
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Calificacion[];
}

export async function fetchRatingProducto(productoId: string): Promise<RatingResumen> {
  const { data, error } = await supabase
    .from('calificaciones')
    .select('puntuacion')
    .eq('producto_id', productoId);
  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0) return { promedio: 0, total: 0 };
  const suma = rows.reduce((acc, r) => acc + r.puntuacion, 0);
  return { promedio: suma / rows.length, total: rows.length };
}

export async function fetchRatingVendedor(vendedorId: string): Promise<RatingResumen> {
  const { data, error } = await supabase
    .from('calificaciones')
    .select('puntuacion')
    .eq('vendedor_id', vendedorId);
  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0) return { promedio: 0, total: 0 };
  const suma = rows.reduce((acc, r) => acc + r.puntuacion, 0);
  return { promedio: suma / rows.length, total: rows.length };
}

export async function fetchCalificacionesDadas(compradorId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('calificaciones')
    .select('producto_id, orden_id')
    .eq('comprador_id', compradorId);
  if (error) throw error;
  // key: `${orden_id}:${producto_id}` para detectar si ya calificó ese item de esa orden
  return new Set((data ?? []).map((r) => `${r.orden_id}:${r.producto_id}`));
}

// --- Vendedor ---

export type CalificacionRecibida = {
  id: string;
  comprador_id: string;
  producto_id: string;
  orden_id: string;
  puntuacion: number;
  comentario: string | null;
  creado_en: string;
  comprador: { nombre: string } | null;
  producto: { nombre: string } | null;
};

export async function fetchMisCalificaciones(vendedorId: string): Promise<CalificacionRecibida[]> {
  const { data, error } = await supabase
    .from('calificaciones')
    .select('id, comprador_id, producto_id, orden_id, puntuacion, comentario, creado_en, comprador:perfiles!comprador_id(nombre), producto:productos(nombre)')
    .eq('vendedor_id', vendedorId)
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CalificacionRecibida[];
}

// --- Admin ---

export type CalificacionAdmin = {
  id: string;
  comprador_id: string;
  vendedor_id: string;
  producto_id: string;
  orden_id: string;
  puntuacion: number;
  comentario: string | null;
  creado_en: string;
  comprador: { nombre: string } | null;
  vendedor: { nombre: string } | null;
  producto: { nombre: string } | null;
};

export async function fetchTodasCalificaciones(): Promise<CalificacionAdmin[]> {
  const { data, error } = await supabase
    .from('calificaciones')
    .select('*, comprador:perfiles!comprador_id(nombre), vendedor:perfiles!vendedor_id(nombre), producto:productos(nombre)')
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CalificacionAdmin[];
}

export async function eliminarCalificacionAdmin(id: string): Promise<void> {
  const { error } = await supabase.from('calificaciones').delete().eq('id', id);
  if (error) throw error;
}
