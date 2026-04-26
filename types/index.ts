import { Tables } from './database';

export type Rol = 'comprador' | 'vendedor' | 'admin';

export type Usuario = Omit<Tables<'perfiles'>, 'rol'> & { rol: Rol };

export type Perfil = Tables<'perfiles'>;
export type Producto = Tables<'productos'>;
export type ItemCarrito = Tables<'carrito'> & { producto?: Producto };
export type Orden = Tables<'ordenes'>;
export type ItemOrden = Tables<'items_orden'>;
export type Conversacion = Tables<'conversaciones'>;
export type Mensaje = Tables<'mensajes'>;
export type ImagenProducto = Tables<'imagenes_producto'>;

export type ProductoConImagenes = Producto & { imagenes: ImagenProducto[] };
export type ProductoConVendedor = Producto & { vendedor?: Pick<Perfil, 'nombre' | 'matricula'> };
