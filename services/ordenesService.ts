import { supabase } from './supabase';

export type OrdenConItems = {
  id: string;
  estado: string | null;
  creado_en: string | null;
  punto_entrega: string | null;
  total: number;
  items_orden: Array<{
    id: string;
    cantidad: number;
    precio_unit: number;
    productos: { nombre: string; categoria: string | null } | null;
  }>;
};

export type VentaVendedor = {
  orden_id: string;
  estado: string | null;
  creado_en: string | null;
  punto_entrega: string | null;
  comprador_nombre: string;
  items: Array<{
    producto_nombre: string;
    categoria: string | null;
    cantidad: number;
    precio_unit: number;
  }>;
  subtotal: number;
};

export async function crearOrden(params: {
  compradorId: string;
  items: Array<{ productoId: string; cantidad: number; precioUnit: number }>;
  puntoEntrega: string;
  total: number;
}): Promise<string> {
  const { data: orden, error } = await supabase
    .from('ordenes')
    .insert({
      comprador_id: params.compradorId,
      total: params.total,
      punto_entrega: params.puntoEntrega,
      estado: 'pendiente',
    })
    .select()
    .single();

  if (error) throw error;

  const { error: itemsError } = await supabase.from('items_orden').insert(
    params.items.map((i) => ({
      orden_id: orden.id,
      producto_id: i.productoId,
      cantidad: i.cantidad,
      precio_unit: i.precioUnit,
    })),
  );

  if (itemsError) throw itemsError;

  return orden.id;
}

export async function fetchOrdenesComprador(compradorId: string): Promise<OrdenConItems[]> {
  const { data, error } = await supabase
    .from('ordenes')
    .select('*, items_orden(*, productos(nombre, categoria))')
    .eq('comprador_id', compradorId)
    .order('creado_en', { ascending: false });

  if (error) throw error;
  return (data ?? []) as OrdenConItems[];
}

export async function fetchVentasVendedor(vendedorId: string): Promise<VentaVendedor[]> {
  const { data, error } = await supabase
    .from('items_orden')
    .select(`
      cantidad,
      precio_unit,
      orden_id,
      productos!inner(nombre, categoria, vendedor_id),
      ordenes(estado, creado_en, punto_entrega, perfiles(nombre))
    `)
    .eq('productos.vendedor_id', vendedorId);

  if (error) throw error;

  const grouped = new Map<string, VentaVendedor>();
  for (const row of data ?? []) {
    const o = row.ordenes as any;
    const oid = row.orden_id;
    if (!grouped.has(oid)) {
      grouped.set(oid, {
        orden_id: oid,
        estado: o?.estado ?? null,
        creado_en: o?.creado_en ?? null,
        punto_entrega: o?.punto_entrega ?? null,
        comprador_nombre: o?.perfiles?.nombre ?? 'Comprador',
        items: [],
        subtotal: 0,
      });
    }
    const venta = grouped.get(oid)!;
    venta.items.push({
      producto_nombre: (row.productos as any)?.nombre ?? '',
      categoria: (row.productos as any)?.categoria ?? null,
      cantidad: row.cantidad,
      precio_unit: row.precio_unit,
    });
    venta.subtotal += row.cantidad * row.precio_unit;
  }

  return Array.from(grouped.values()).sort((a, b) =>
    (b.creado_en ?? '').localeCompare(a.creado_en ?? ''),
  );
}