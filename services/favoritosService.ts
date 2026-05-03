/*
 * SQL Migration — Ejecutar en Supabase SQL Editor antes de usar este servicio:
 *
 * CREATE TABLE IF NOT EXISTS public.favoritos (
 *   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   comprador_id uuid NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
 *   producto_id uuid NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
 *   creado_en timestamptz NOT NULL DEFAULT now(),
 *   UNIQUE(comprador_id, producto_id)
 * );
 * ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "comprador_gestiona_favoritos" ON public.favoritos
 *   FOR ALL USING (auth.uid() = comprador_id) WITH CHECK (auth.uid() = comprador_id);
 */

import { supabase } from './supabase';

/**
 * Alterna el estado de favorito de un producto para un comprador.
 * Intenta INSERT; si falla por unique constraint, hace DELETE.
 * Retorna true si ahora es favorito, false si se quitó.
 */
export async function toggleFavorito(compradorId: string, productoId: string): Promise<boolean> {
  // Intentar insertar
  const { error: insertError } = await supabase
    .from('favoritos')
    .insert({ comprador_id: compradorId, producto_id: productoId });

  if (!insertError) {
    // Insertado correctamente — ahora es favorito
    return true;
  }

  // Si el error es por unique constraint (código 23505), eliminar
  if (insertError.code === '23505') {
    const { error: deleteError } = await supabase
      .from('favoritos')
      .delete()
      .eq('comprador_id', compradorId)
      .eq('producto_id', productoId);

    if (deleteError) throw deleteError;
    return false;
  }

  // Otro error — propagar
  throw insertError;
}

/**
 * Obtiene todos los producto_ids marcados como favorito por el comprador.
 */
export async function fetchFavoritos(compradorId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('favoritos')
    .select('producto_id')
    .eq('comprador_id', compradorId);

  if (error) throw error;
  return (data ?? []).map((row: { producto_id: string }) => row.producto_id);
}

/**
 * Comprueba si un producto específico está en los favoritos del comprador.
 */
export async function esFavorito(compradorId: string, productoId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('favoritos')
    .select('id')
    .eq('comprador_id', compradorId)
    .eq('producto_id', productoId)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}
