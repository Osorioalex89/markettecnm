# MarketTecnm — Documentación Técnica del Proyecto

**Desarrollador:** Alexander Osorio  
**Fecha:** Abril 2026  
**Versión:** 1.0.0

---

## 1. ¿Qué es MarketTecnm?

MarketTecnm es un **marketplace interno** para alumnos y staff del Tecnológico de Centla. Permite a los alumnos publicar, buscar y comprar productos o servicios entre sí dentro de la institución, desde cualquier dispositivo móvil (iOS y Android).

El proyecto fue desarrollado migrando un prototipo previo en **Python/Flet con SQLite** a una aplicación móvil moderna con **React Native + Supabase (PostgreSQL en la nube)**.

---

## 2. Stack Tecnológico

| Tecnología | Uso |
|---|---|
| **React Native + Expo Go** | Framework móvil (iOS y Android) |
| **TypeScript** | Tipado estricto en todo el proyecto |
| **Supabase** | Backend: PostgreSQL, Auth, Storage, Realtime |
| **Zustand** | Estado global (sesión, carrito) |
| **NativeWind v4** | Tailwind CSS para React Native |
| **@expo/vector-icons** | Íconos de la interfaz (Ionicons) |
| **expo-notifications** | Push notifications |
| **expo-image-picker** | Selección de imágenes del dispositivo |
| **expo-linear-gradient** | Gradientes en la UI |
| **React Navigation** | Navegación entre pantallas |

---

## 3. Estructura de Carpetas

```
MarkeTTecnm/
├── App.tsx                        → Punto de entrada; detecta sesión y enruta por rol
├── index.ts                       → Registro de la app con Expo
├── package.json                   → Dependencias del proyecto
├── metro.config.js                → Configuración Metro (fix íconos en Windows)
├── tailwind.config.js             → Paleta de colores Dark Luxury Orange
├── global.css                     → Directivas NativeWind
│
├── /app
│   ├── LoginScreen.tsx            → Login y registro; detecta rol admin automáticamente
│   ├── ChatScreen.tsx             → Chat individual en tiempo real (Realtime)
│   │
│   ├── /comprador                 → Pantallas del rol Comprador
│   │   ├── TabsComprador.tsx      → Bottom tabs: Inicio, Buscar, Carrito, Mensajes, Perfil
│   │   ├── InicioComprador.tsx    → Feed principal de productos con imágenes
│   │   ├── BuscarComprador.tsx    → Búsqueda por nombre + filtros por categoría
│   │   ├── CarritoComprador.tsx   → Carrito, checkout y selector de punto de entrega
│   │   └── HistorialComprador.tsx → Lista de órdenes realizadas
│   │
│   ├── /vendedor                  → Pantallas del rol Vendedor
│   │   ├── TabsVendedor.tsx       → Bottom tabs: Inicio, Publicar, Ventas, Mensajes, Perfil
│   │   ├── InicioVendedor.tsx     → Dashboard: estadísticas + listado de mis productos
│   │   ├── PublicarVendedor.tsx   → Formulario para publicar producto con foto
│   │   └── VentasVendedor.tsx     → Historial de ventas recibidas agrupadas por orden
│   │
│   └── /admin                     → Pantallas del rol Administrador
│       ├── TabsAdmin.tsx          → Bottom tabs: Panel, Usuarios, Productos, Perfil
│       ├── HomeAdmin.tsx          → Dashboard con estadísticas en tiempo real
│       ├── UsuariosAdmin.tsx      → Gestión de usuarios: cambio de rol
│       └── ProductosAdmin.tsx     → Moderación: activar u ocultar productos + eliminación permanente
│
├── /components
│   ├── ProductCard.tsx            → Card reutilizable: imagen, precio, categoría, botones
│   ├── ProductoDetalle.tsx        → Modal tipo MercadoLibre con detalle completo del producto
│   └── ListaChats.tsx             → Lista de conversaciones con badges de mensajes no leídos; long press para eliminar
│
├── /store
│   ├── authStore.ts               → Estado de sesión (usuario, rol, perfil)
│   └── carritoStore.ts            → Estado local del carrito de compras
│
├── /services
│   ├── supabase.ts                → Cliente Supabase configurado con AsyncStorage
│   ├── authService.ts             → Login, registro, logout, obtenerPerfil
│   ├── productosService.ts        → CRUD de productos + subida de imágenes a Storage
│   ├── ordenesService.ts          → Crear órdenes, historial comprador, ventas vendedor
│   ├── chatService.ts             → Conversaciones, mensajes, Realtime, badges no leídos, eliminar conversación
│   └── adminService.ts            → Stats globales, gestión usuarios, moderación productos, eliminar producto
│
└── /types
    ├── index.ts                   → Tipos: Rol, Usuario, Perfil, Producto, Mensaje, etc.
    └── database.ts                → Tipos generados automáticamente desde Supabase
```

---

## 4. Roles de Usuario

### Comprador
- Ve el feed de todos los productos publicados por vendedores
- Busca productos por nombre y filtra por categoría
- Agrega productos al carrito con cantidad variable
- Completa compras seleccionando un punto de entrega en el campus
- Ve su historial completo de pedidos
- Inicia chat con el vendedor directamente desde la card del producto

### Vendedor
- Publica productos con foto (cámara o galería), nombre, precio, categoría y stock
- Edita o elimina sus productos publicados
- Ve su historial de ventas recibidas, agrupadas por orden
- Responde mensajes de compradores interesados
- Recibe push notifications al recibir un mensaje nuevo

### Administrador
- Ve estadísticas globales en tiempo real: total de alumnos, productos activos, órdenes del día
- Cambia el rol de cualquier alumno (comprador ↔ vendedor)
- Activa u oculta productos del marketplace sin eliminarlos
- Elimina permanentemente cualquier producto del marketplace

---

## 5. Base de Datos (Supabase / PostgreSQL)

### Tablas Principales

| Tabla | Descripción |
|---|---|
| `perfiles` | Datos del usuario: nombre, matrícula, rol, token de notificaciones |
| `productos` | Nombre, descripción, precio, categoría, stock, activo, vendedor_id |
| `imagenes_producto` | URLs de imágenes por producto (relación 1:N con productos) |
| `ordenes` | Compra confirmada: comprador, punto de entrega, estado, total |
| `items_orden` | Productos individuales dentro de cada orden con cantidad y precio |
| `conversaciones` | Canal de chat entre un comprador y un vendedor |
| `mensajes` | Mensajes individuales con estado leído/no leído |

### Seguridad (Row Level Security)
Todas las tablas tienen políticas RLS activas. Cada rol solo puede ver y modificar sus propios datos:
- Los compradores solo ven sus órdenes y mensajes
- Los vendedores solo editan sus propios productos
- El administrador tiene acceso completo vía función `es_admin()`
- Los participantes de un chat pueden eliminar su propia conversación (y sus mensajes) con políticas DELETE en `conversaciones` y `mensajes`
- Solo el administrador puede hacer DELETE permanente en `productos` (diferente del toggle oculto/activo del vendedor)

### Storage
- Bucket **`productos`** (público) para imágenes de productos
- Las imágenes se suben directamente desde el dispositivo al publicar o editar
- Formatos soportados: JPEG, PNG, WebP — máximo 5 MB

---

## 6. Funcionalidades Implementadas

1. **Autenticación completa** — Login por matrícula, registro, persistencia de sesión con AsyncStorage, logout
2. **Rutas protegidas por rol** — Cada rol ve solo sus pantallas; el sistema enruta automáticamente al iniciar sesión
3. **Feed de productos** — Cards con imagen real del producto, precio, vendedor y categoría
4. **Búsqueda y filtros** — Por nombre en tiempo real y por categoría
5. **Publicación de productos** — Formulario completo: foto desde cámara o galería, nombre, precio, categoría, stock
6. **Edición y eliminación** — Edición con formulario pre-llenado y nueva imagen opcional; eliminación con confirmación
7. **Carrito de compras** — Agregar, incrementar, decrementar y eliminar productos
8. **Checkout** — Selección de punto de entrega del campus, confirmación y vaciado automático del carrito
9. **Historial de pedidos** — Para el comprador (mis órdenes) y el vendedor (ventas recibidas)
10. **Chat en tiempo real** — Mensajería instantánea con Supabase Realtime; burbujas diferenciadas
11. **Push notifications** — Aviso en dispositivo físico al recibir un mensaje nuevo. El error `expo-notifications: Android Push notifications (remote)...` visible en Expo Go es **esperado y no afecta ninguna funcionalidad** — desaparece al generar el APK con `eas build`
12. **Badges de no leídos** — Contador en el tab Mensajes que se actualiza en tiempo real
13. **Panel de administrador** — Dashboard con stats, gestión de usuarios y moderación de contenido
14. **Eliminar conversaciones** — Long press en cualquier chat de `ListaChats` muestra confirmación y borra la conversación completa (mensajes + conversación) de Supabase
15. **Eliminar publicaciones (admin)** — Botón "Eliminar" en `ProductosAdmin` permite borrado permanente de productos; diferente del toggle oculto que es reversible

---

## 7. Usuarios de Prueba

| Rol | Matrícula / Usuario | Contraseña |
|---|---|---|
| Administrador | `admin` | `Admin123!` |
| Vendedor | `20240001` | `Vendedor123!` |
| Comprador | `20240002` | `Comprador123!` |

---

## 8. Propuestas para Implementación Futura

Las siguientes funcionalidades pueden desarrollarse para extender la aplicación:

### 8.1 Sistema de Calificaciones y Reseñas
Permitir que los compradores califiquen productos y vendedores tras completar una compra. Mostrar el rating promedio en las cards y en el perfil del vendedor.

**Tablas necesarias:** `calificaciones (id, orden_id, comprador_id, vendedor_id, producto_id, puntuacion, comentario, creado_en)`

### 8.2 Modo Claro / Modo Oscuro
Toggle en la pantalla de Perfil para cambiar entre el tema oscuro actual (negro + naranja) y un tema claro (blanco + naranja). El tema se guardaría con AsyncStorage para persistir entre sesiones.

**Implementación:** Zustand `themeStore` + hook `useTheme()` que expone tokens de color (`bg`, `surface`, `text`, `accent`).

### 8.3 Sistema de Favoritos
Botón de corazón en las cards para guardar productos en una lista personal. Tab "Guardados" en el perfil del comprador.

**Tabla necesaria:** `favoritos (id, comprador_id, producto_id, creado_en)`

### 8.4 Filtros Avanzados de Búsqueda
- Rango de precio con slider
- Solo productos con stock disponible
- Ordenar por: más recientes, precio menor a mayor, precio mayor a menor

### 8.5 Perfil Público del Vendedor
Pantalla con todos los productos de un vendedor, calificación promedio y datos de contacto básicos. Accesible al tocar el nombre del vendedor en una card.

### 8.6 Sistema de Reportes
Botón "Reportar" en productos o conversaciones. Genera una alerta en el panel del administrador para revisión manual.

**Tabla necesaria:** `reportes (id, reportado_por, tipo, referencia_id, motivo, revisado, creado_en)`

### 8.7 Estadísticas para el Vendedor
Gráficas simples en el dashboard: ventas por semana, productos más vistos, ingresos acumulados del mes.

### 8.8 Pagos Digitales
Integración con MercadoPago o Clip para pagos en línea además del pago presencial en punto de entrega.

### 8.9 Búsqueda por Imagen
Subir una foto para buscar productos similares en el catálogo usando reconocimiento de imágenes.

### 8.10 Notificaciones In-App (Banner)
Banner interno al recibir un mensaje o venta nueva, sin depender de push notifications del sistema operativo.

---

## 9. Cómo Ejecutar el Proyecto

### Requisitos
- Node.js 18+
- Expo Go instalado en el dispositivo móvil
- Cuenta de Supabase (ya configurada)

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor de desarrollo
npx expo start --clear

# 3. Escanear el QR con Expo Go en tu dispositivo
```

### Variables de entorno
El archivo `services/supabase.ts` contiene la URL y la clave pública de Supabase (anon key). Estas credenciales son seguras para incluir en el cliente — el acceso real está controlado por las políticas RLS en la base de datos.

---

*Documentación generada para MarketTecnm — Tecnológico de Centla, 2026*
