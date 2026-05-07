import { supabase } from './supabase';

export type TipoReporte = 'producto' | 'usuario' | 'chat';

export type Reporte = {
  id: string;
  reporter_id: string;
  tipo: TipoReporte;
  referencia_id: string;
  motivo: string;
  revisado: boolean;
  creado_en: string;
  reporter?: { nombre: string; matricula: string } | null;
};

export async function crearReporte(
  reporterId: string,
  tipo: TipoReporte,
  referenciaId: string,
  motivo: string,
): Promise<void> {
  const { error } = await supabase.from('reportes').insert({
    reporter_id: reporterId,
    tipo,
    referencia_id: referenciaId,
    motivo,
  });
  if (error) throw error;
}

export async function fetchReportes(): Promise<Reporte[]> {
  const { data, error } = await supabase
    .from('reportes')
    .select('*, reporter:reporter_id(nombre, matricula)')
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Reporte[];
}

export async function marcarRevisado(id: string, revisado: boolean): Promise<void> {
  const { error } = await supabase.from('reportes').update({ revisado }).eq('id', id);
  if (error) throw error;
}

export async function contarPendientes(): Promise<number> {
  const { count, error } = await supabase
    .from('reportes')
    .select('*', { count: 'exact', head: true })
    .eq('revisado', false);
  if (error) return 0;
  return count ?? 0;
}
