import { supabase } from './supabase';
import type { Mensaje } from '../types';

export type ConversacionConDetalle = {
  id: string;
  comprador_id: string;
  vendedor_id: string;
  creado_en: string | null;
  otro: { id: string; nombre: string };
  ultimo_mensaje: string | null;
  ultimo_en: string | null;
  no_leidos: number;
};

export async function obtenerOCrearConversacion(
  compradorId: string,
  vendedorId: string,
): Promise<string> {
  const { data: existing } = await supabase
    .from('conversaciones')
    .select('id')
    .eq('comprador_id', compradorId)
    .eq('vendedor_id', vendedorId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('conversaciones')
    .insert({ comprador_id: compradorId, vendedor_id: vendedorId })
    .select()
    .single();

  if (error) throw error;
  return data.id;
}

export async function fetchConversaciones(userId: string): Promise<ConversacionConDetalle[]> {
  const { data, error } = await supabase
    .from('conversaciones')
    .select(`
      id, comprador_id, vendedor_id, creado_en,
      comprador:perfiles!conversaciones_comprador_id_fkey(id, nombre),
      vendedor:perfiles!conversaciones_vendedor_id_fkey(id, nombre),
      mensajes(contenido, enviado_en, leido, remitente_id)
    `)
    .or(`comprador_id.eq.${userId},vendedor_id.eq.${userId}`);

  if (error) throw error;

  return (data ?? [])
    .map((c: any) => {
      const esComprador = c.comprador_id === userId;
      const otro = esComprador ? c.vendedor : c.comprador;
      const msgs: any[] = c.mensajes ?? [];
      const sorted = [...msgs].sort((a, b) =>
        (b.enviado_en ?? '').localeCompare(a.enviado_en ?? ''),
      );
      const ultimo = sorted[0] ?? null;
      const no_leidos = msgs.filter(
        (m) => !m.leido && m.remitente_id !== userId,
      ).length;

      return {
        id: c.id,
        comprador_id: c.comprador_id,
        vendedor_id: c.vendedor_id,
        creado_en: c.creado_en,
        otro: { id: otro?.id ?? '', nombre: otro?.nombre ?? 'Usuario' },
        ultimo_mensaje: ultimo?.contenido ?? null,
        ultimo_en: ultimo?.enviado_en ?? null,
        no_leidos,
      };
    })
    .sort((a, b) =>
      (b.ultimo_en ?? b.creado_en ?? '').localeCompare(
        a.ultimo_en ?? a.creado_en ?? '',
      ),
    );
}

export async function fetchMensajes(conversacionId: string): Promise<Mensaje[]> {
  const { data, error } = await supabase
    .from('mensajes')
    .select('*')
    .eq('conversacion_id', conversacionId)
    .order('enviado_en', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function enviarMensaje(
  conversacionId: string,
  remitenteId: string,
  contenido: string,
  destinatarioId: string,
): Promise<Mensaje> {
  const { data, error } = await supabase
    .from('mensajes')
    .insert({
      conversacion_id: conversacionId,
      remitente_id: remitenteId,
      contenido: contenido.trim(),
    })
    .select()
    .single();

  if (error) throw error;

  // Intentar enviar push notification (no bloquea si falla)
  try {
    const { data: perfil } = await supabase
      .from('perfiles')
      .select('expo_push_token')
      .eq('id', destinatarioId)
      .single();

    if (perfil?.expo_push_token) {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: perfil.expo_push_token,
          title: 'Nuevo mensaje',
          body: contenido.trim(),
          data: { conversacionId },
        }),
      });
    }
  } catch {
    // Push falla silenciosamente
  }

  return data;
}

export async function marcarLeidos(
  conversacionId: string,
  receptorId: string,
): Promise<void> {
  await supabase
    .from('mensajes')
    .update({ leido: true })
    .eq('conversacion_id', conversacionId)
    .neq('remitente_id', receptorId)
    .eq('leido', false);
}

export async function fetchTotalNoLeidos(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('mensajes')
    .select('*', { count: 'exact', head: true })
    .eq('leido', false)
    .neq('remitente_id', userId);
  return error ? 0 : (count ?? 0);
}

export function suscribirseANoLeidosGlobal(
  userId: string,
  onChange: () => void,
) {
  return supabase
    .channel(`badge:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'mensajes' },
      (payload) => {
        if (
          (payload.eventType === 'INSERT' && (payload.new as any).remitente_id !== userId) ||
          payload.eventType === 'UPDATE'
        ) {
          onChange();
        }
      },
    )
    .subscribe();
}

export function suscribirseAMensajes(
  conversacionId: string,
  onNuevoMensaje: (msg: Mensaje) => void,
) {
  return supabase
    .channel(`mensajes:${conversacionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'mensajes',
        filter: `conversacion_id=eq.${conversacionId}`,
      },
      (payload) => onNuevoMensaje(payload.new as Mensaje),
    )
    .subscribe();
}