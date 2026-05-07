import { supabase } from './supabase';
import type { Producto } from '../types';

export async function publicarProducto(params: {
  vendedorId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  stock: number;
  imagenUri?: string;
  fechaLimiteEntrega?: string | null;
}): Promise<Producto> {
  const { data: producto, error } = await supabase
    .from('productos')
    .insert({
      vendedor_id: params.vendedorId,
      nombre: params.nombre.trim(),
      descripcion: params.descripcion.trim() || null,
      precio: params.precio,
      categoria: params.categoria,
      stock: params.stock,
      activo: true,
      fecha_limite_entrega: params.fechaLimiteEntrega ?? null,
    })
    .select()
    .single();

  if (error) throw error;

  if (params.imagenUri) {
    const ext = params.imagenUri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    const filePath = `${params.vendedorId}/${producto.id}.${ext}`;
    try {
      const response = await fetch(params.imagenUri);
      const arrayBuffer = await response.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(filePath, arrayBuffer, { contentType: mime, upsert: true });
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('productos').getPublicUrl(filePath);
        await supabase.from('imagenes_producto').insert({ producto_id: producto.id, url: publicUrl, orden: 1 });
      }
    } catch {
      // Imagen fallida — producto ya fue creado, no es bloqueante
    }
  }

  return producto;
}

export type ProductoConVendedor = Producto & {
  perfiles: { nombre: string; matricula: string | null } | null;
  imagen_url?: string | null;
};

function extraerImagenUrl(raw: any): string | null {
  const imagenes: { url: string; orden: number | null }[] = raw.imagenes_producto ?? [];
  if (!imagenes.length) return null;
  return [...imagenes].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))[0]?.url ?? null;
}

export async function fetchProductos(): Promise<ProductoConVendedor[]> {
  const { data, error } = await supabase
    .from('productos')
    .select('*, perfiles(nombre, matricula), imagenes_producto(url, orden)')
    .eq('activo', true)
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p: any) => ({
    ...p,
    imagen_url: extraerImagenUrl(p),
  })) as ProductoConVendedor[];
}

export async function buscarProductos(
  query: string,
  categoria?: string,
): Promise<ProductoConVendedor[]> {
  let req = supabase
    .from('productos')
    .select('*, perfiles(nombre, matricula), imagenes_producto(url, orden)')
    .eq('activo', true);

  if (query.trim()) {
    req = req.ilike('nombre', `%${query.trim()}%`);
  }
  if (categoria && categoria !== 'Todos') {
    req = req.eq('categoria', categoria);
  }

  const { data, error } = await req.order('creado_en', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p: any) => ({
    ...p,
    imagen_url: extraerImagenUrl(p),
  })) as ProductoConVendedor[];
}

export async function fetchMisProductos(vendedorId: string): Promise<ProductoConVendedor[]> {
  const { data, error } = await supabase
    .from('productos')
    .select('*, perfiles(nombre, matricula), imagenes_producto(url, orden)')
    .eq('vendedor_id', vendedorId)
    .eq('activo', true)
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p: any) => ({ ...p, imagen_url: extraerImagenUrl(p) })) as ProductoConVendedor[];
}

export async function editarProducto(params: {
  id: string;
  vendedorId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  stock: number;
  imagenUri?: string;
  fechaLimiteEntrega?: string | null;
}): Promise<void> {
  const { error } = await supabase
    .from('productos')
    .update({
      nombre: params.nombre.trim(),
      descripcion: params.descripcion.trim() || null,
      precio: params.precio,
      categoria: params.categoria,
      stock: params.stock,
      fecha_limite_entrega: params.fechaLimiteEntrega ?? null,
    })
    .eq('id', params.id);
  if (error) throw error;

  if (params.imagenUri) {
    const ext = params.imagenUri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    const filePath = `${params.vendedorId}/${params.id}.${ext}`;
    try {
      const response = await fetch(params.imagenUri);
      const arrayBuffer = await response.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(filePath, arrayBuffer, { contentType: mime, upsert: true });
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('productos').getPublicUrl(filePath);
        await supabase.from('imagenes_producto').delete().eq('producto_id', params.id);
        await supabase.from('imagenes_producto').insert({ producto_id: params.id, url: publicUrl, orden: 1 });
      }
    } catch {
      // Imagen fallida — campos del producto ya fueron guardados
    }
  }
}

export async function eliminarProducto(id: string): Promise<void> {
  const { error } = await supabase
    .from('productos')
    .update({ activo: false })
    .eq('id', id);
  if (error) throw error;
}
