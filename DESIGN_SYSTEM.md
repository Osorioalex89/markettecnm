# DESIGN_SYSTEM.md — MarketTecnm

Sistema de diseño oficial. Toda decisión visual de la app parte de este documento.
Mockup de referencia: `mockup.html`

---

## Concepto

**"Dark Luxury — Orange Heat"** — Una app de mercado estudiantil que se siente premium y apetitosa.
Fondos profundos casi negros con capas de vidrio esmerilado (glassmorphism) y acentos de **Naranja Vibrante + Ámbar**. El naranja estimula el apetito y la urgencia de compra (referencia: Uber Eats, Rappi dark mode). El fondo oscuro le da el diferencial premium que lo separa de apps genéricas.

> **Por qué naranja y no violeta:** MarketTecnm es principalmente un marketplace de comida en el TecNM. Los colores cálidos generan apetito y confianza en contextos de venta de alimentos.

---

## Paleta de colores

### Fondos
| Token | Valor | Uso |
|---|---|---|
| `bg-primary` | `#0A0A0A` | Fondo base de toda la app |
| `bg-secondary` | `#141414` | Fondo de secciones alternadas |
| `bg-card` | `rgba(255,255,255,0.05)` | Superficie de tarjetas glass |
| `bg-card-hover` | `rgba(255,255,255,0.08)` | Estado hover/pressed de tarjetas |

### Acentos
| Token | Valor | Uso |
|---|---|---|
| `primary` | `#FF6B2B` | Color principal, botones CTA, íconos activos |
| `primary-dark` | `#E05520` | Estados pressed/hover del botón primario |
| `accent` | `#FFB830` | Precios, badges de precio, highlights de texto |
| `accent-soft` | `#FFC84A` | Versión clara del ámbar, gradientes de texto |
| `teal` | `#14B8A6` | Tercer acento (ícono "Guardados", acciones terciarias) |

### Bordes glass
| Token | Valor | Uso |
|---|---|---|
| `border-glass` | `rgba(255,255,255,0.09)` | Borde estándar de tarjetas |
| `border-glass-2` | `rgba(255,255,255,0.16)` | Borde destacado, botones secundarios |
| `border-orange` | `rgba(255,107,43,0.28)` | Borde de elementos activos/seleccionados |

### Texto
| Token | Valor | Uso |
|---|---|---|
| `text-primary` | `#F5F5F5` | Títulos, labels principales |
| `text-secondary` | `rgba(245,245,245,0.55)` | Subtítulos, texto secundario |
| `text-muted` | `rgba(245,245,245,0.30)` | Placeholders, labels de formulario, nav inactivo |

### Semánticos
| Token | Valor | Uso |
|---|---|---|
| `success` | `#4ADE80` / `rgba(34,197,94,0.12)` | Badge "Disponible", "Nuevo", "Buen estado" |
| `warning` | `#FFB830` | Alertas, stock bajo (comparte valor con `accent`) |
| `error` | `#F87171` | Errores de formulario |

---

## Gradientes

```
Gradiente principal (botones, logos):
  linear-gradient(135deg, #FF6B2B 0%, #FFB830 100%)

Gradiente de texto (precios, títulos hero):
  linear-gradient(135deg, #FF8C55 0%, #FFB830 100%)
  → Aplicar con -webkit-background-clip: text

Gradiente avatar vendedor:
  linear-gradient(135deg, #FF6B2B, #E05520)

Gradiente avatar comprador:
  linear-gradient(135deg, #FFB830, #FF6B2B)

Orbes de fondo (mesh gradient):
  radial-gradient(ellipse 80% 60% at 35% 25%, rgba(255,107,43,0.18) 0%, transparent 55%)
  radial-gradient(ellipse 60% 50% at 75% 75%, rgba(255,184,48,0.12) 0%, transparent 55%)

Glassmorphism tint en cards de comida:
  background: rgba(255, 107, 43, 0.06)  ← glow naranja muy sutil
```

---

## Tipografía

| Rol | Fuente | Pesos | Uso |
|---|---|---|---|
| Display | **Syne** | 600, 700, 800 | Títulos de pantalla, precios, logo, labels de nav |
| Body | **Plus Jakarta Sans** | 400, 500, 600, 700 | Todo el texto corrido, botones, inputs, etiquetas |

### Escala de tamaños
| Nombre | Tamaño | Fuente | Peso | Uso |
|---|---|---|---|---|
| `logo` | 24px | Syne | 800 | Nombre de la app |
| `screen-title` | 21–22px | Syne | 700 | Título de pantalla (h2 en header) |
| `section-title` | 15px | Syne | 700 | Subtítulos de sección |
| `price` | 15–28px | Syne | 800 | Precios de productos |
| `body` | 14px | Plus Jakarta Sans | 400–500 | Texto descriptivo |
| `label` | 13px | Plus Jakarta Sans | 600 | Nombres de producto, vendedor |
| `caption` | 11–12px | Plus Jakarta Sans | 500–600 | Meta info, badges, nav labels |
| `form-label` | 11px | Plus Jakarta Sans | 700 | Labels de campos (uppercase) |

---

## Glassmorphism — Receta

```css
/* Tarjeta estándar */
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(24px);
-webkit-backdrop-filter: blur(24px);
border: 1px solid rgba(255, 255, 255, 0.09);
border-radius: 18px;

/* Input */
background: rgba(255, 255, 255, 0.06);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.09);
border-radius: 13px;

/* Input focus */
border-color: rgba(255, 107, 43, 0.6);
background: rgba(255, 107, 43, 0.07);
box-shadow: 0 0 0 3px rgba(255, 107, 43, 0.14);

/* Bottom nav */
background: rgba(10, 10, 10, 0.92);
backdrop-filter: blur(30px);
border-top: 1px solid rgba(255, 255, 255, 0.06);
```

> **Regla crítica**: el glassmorphism solo funciona cuando hay gradientes/colores visibles detrás de la capa. Siempre asegurarse de que el fondo tenga orbes de color activos.

---

## Sombras

```css
/* Tarjeta elevada */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

/* Botón primario */
box-shadow: 0 8px 24px rgba(255, 107, 43, 0.35);

/* Avatar / logo con glow naranja */
box-shadow: 0 0 18px rgba(255, 107, 43, 0.3);

/* Phone frame (solo mockup) */
box-shadow: 0 48px 96px rgba(0,0,0,0.85), 0 0 80px rgba(255,107,43,0.08);
```

---

## Border radius

| Elemento | Radio |
|---|---|
| Tarjeta grande (feed, seller card) | `18px` |
| Tarjeta pequeña (quick action, stat) | `16px` |
| Input / Select | `13px` |
| Botón primario | `14px` |
| Avatar | `13px` |
| Badge / Chip | `6–8px` |
| Pill (categoría) | `20px` (full) |
| Logo icon | `22px` |
| Phone frame (mockup) | `52px` |

---

## Componentes clave

### Botón primario
- Gradiente: `#FF6B2B → #FFB830`
- Border radius: `14px`
- Padding: `15px 20px`
- Font: Plus Jakarta Sans 700, 14px
- Shadow: `0 8px 24px rgba(255,107,43,0.35)`

### Badge de estado
- Fondo: `rgba(34,197,94,0.12)`
- Borde: `rgba(34,197,94,0.18)`
- Color texto: `#4ADE80`
- Font: 10–11px, 600

### Chip de categoría (activo)
- Fondo: `rgba(255,107,43,0.18)`
- Borde: `rgba(255,107,43,0.45)`
- Color texto: `#FF8C55`

### Navigation bar
- `position: sticky; bottom: 0`
- Fondo: `rgba(10,10,10,0.92)` con `backdrop-filter: blur(30px)`
- Ícono activo: `#FF6B2B` con `drop-shadow(0 0 6px rgba(255,107,43,0.6))`
- Ícono inactivo: `rgba(245,245,245,0.30)`

### Form label
- Texto en UPPERCASE
- `letter-spacing: 0.9px`
- Color: `var(--text-muted)`
- Font: Plus Jakarta Sans 700, 11px

---

## Pantallas definidas (v1.0)

| # | Pantalla | Rol | Archivo ref |
|---|---|---|---|
| 1 | Login / Registro | Todos | `mockup.html` → sección 01 |
| 2 | Home | Vendedor | `mockup.html` → sección 02 |
| 3 | Home | Comprador | `mockup.html` → sección 03 |
| 4 | Publicar Producto | Vendedor | `mockup.html` → sección 04 |
| 5 | Detalle de Producto | Comprador | `mockup.html` → sección 05 |

### Pantallas pendientes de diseñar (v1.1+)
- [ ] Carrito de compras
- [ ] Checkout / Confirmar pedido
- [ ] Historial de compras (Comprador)
- [ ] Historial de ventas (Vendedor)
- [ ] Chat / Mensajería
- [ ] Perfil de usuario
- [ ] Panel de administración

---

## Convenciones de implementación (React Native)

- Usar **NativeWind** para estilos utilitarios
- Glassmorphism con `expo-blur` (`<BlurView>`) — NO `backdrop-filter` (no es nativo)
- Gradientes con `expo-linear-gradient`
- Fuentes: cargar con `expo-font` o `@expo-google-fonts/syne` + `@expo-google-fonts/plus-jakarta-sans`
- Íconos: `@expo/vector-icons` (Ionicons o MaterialCommunityIcons) — **nunca emojis en la UI**
- Todo el texto de UI en **español**
- Estilos con `style={{}}` inline para gradientes y valores rgba; NativeWind (`className`) para el resto
- **Nunca mezclar** estilos del sistema anterior (violeta/azul) con el actual (naranja)

### Regla de íconos
Todos los íconos de la app usan `@expo/vector-icons`. Prohibido usar emojis como íconos en cualquier componente de producción — el mockup los usa solo como placeholder visual. Al implementar, cada emoji se reemplaza por su equivalente en Ionicons o MaterialCommunityIcons.

---

## Patrones de código implementados (TSX)

Tokens reales que ya están en uso en la app. Usarlos como referencia directa al codificar nuevas pantallas.

### Paleta de tokens actuales (tailwind.config.js)

| Token Tailwind | Valor hex | Uso |
|---|---|---|
| `background` | `#0A0A0A` | Fondo base de pantallas |
| `surface` | `#141414` | Cards, modales, contenedores |
| `surface-2` | `#1E1E1E` | Inputs, layers internos de cards |
| `border` | `#2E2E2E` | Bordes neutros |
| `primary` | `#FF6B2B` | CTA, botones, íconos activos Comprador |
| `primary-dark` | `#E05520` | Pressed/hover de primary |
| `accent` | `#FFB830` | Precios, badges Vendedor, highlights |
| `text-primary` | `#F5F5F5` | Texto principal |
| `text-secondary` | `#999999` | Texto secundario |
| `error` | `#FF4D6D` | Errores, logout |
| `success` | `#4DFFA6` | Estados positivos |

Colores extra solo inline (`style={{}}`):
- `#444` / `#555` — íconos y texto inactivo/terciario
- `#666` — placeholders de inputs
- `#222` — separadores internos de cards
- `#0F0F0F` — fondo de tab bar
- `#1A1A1A` — borde tab bar, fondo de tabs no seleccionadas

### Gradientes

**Fondo de pantalla (hero / header):**
```tsx
<LinearGradient
  colors={['#1C0A00', '#0A0A0A']}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 1 }}
  style={{ paddingTop: 56, paddingBottom: 32, paddingHorizontal: 24 }}
>
```

**Glow ambiental (overlay decorativo, no interactivo):**
```tsx
<LinearGradient
  colors={['rgba(255,107,43,0.12)', 'transparent']}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 1 }}
  style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 280 }}
  pointerEvents="none"
/>
```

**Línea accent en el top de una card:**
```tsx
<LinearGradient
  colors={['#FF6B2B', '#FFB830', 'transparent']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={{ height: 2 }}
/>
```

**Ícono con gradiente (hero icon o tab hero):**
```tsx
<LinearGradient
  colors={['#FF8C55', '#FF6B2B', '#E05520']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={{
    width: 68, height: 68, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#FF6B2B', shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  }}
>
  <Ionicons name="storefront" size={30} color="#fff" />
</LinearGradient>
```

**Botón primario (CTA principal):**
```tsx
<TouchableOpacity onPress={...} activeOpacity={0.85} style={{ borderRadius: 18, overflow: 'hidden' }}>
  <LinearGradient
    colors={['#FF6B2B', '#E05520']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{ paddingVertical: 16, alignItems: 'center' }}
  >
    <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Acción</Text>
  </LinearGradient>
</TouchableOpacity>
```

**Avatar inicial (sin foto):**
```tsx
// Comprador → naranja
<LinearGradient colors={['#FF6B2B', '#E05520']} style={{ width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
  <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{nombre[0].toUpperCase()}</Text>
</LinearGradient>

// Vendedor → ámbar
<LinearGradient colors={['#FFB830', '#FF6B2B']} style={{ width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
  <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{nombre[0].toUpperCase()}</Text>
</LinearGradient>
```

### Cards / Surfaces

**Card estándar:**
```tsx
<View style={{
  backgroundColor: '#141414',
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#2E2E2E',
  overflow: 'hidden',
}}>
```

**Card destacada (borde naranja + glow):**
```tsx
<View style={{
  backgroundColor: 'rgba(20,20,20,0.95)',
  borderRadius: 28,
  borderWidth: 1,
  borderColor: 'rgba(255,107,43,0.2)',
  overflow: 'hidden',
  shadowColor: '#FF6B2B',
  shadowOpacity: 0.15,
  shadowRadius: 40,
  elevation: 12,
}}>
  <LinearGradient colors={['#FF6B2B', '#FFB830', 'transparent']} start={{x:0,y:0}} end={{x:1,y:0}} style={{ height: 2 }} />
  <View style={{ padding: 24 }}>...</View>
</View>
```

**Ícono con gradiente en card:**
```tsx
<LinearGradient
  colors={['#FF8C55', '#FF6B2B']}   // o ['#FFD060', '#FFB830'] para ámbar
  style={{ width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}
>
  <Ionicons name="cube" size={20} color="#fff" />
</LinearGradient>
```

### Inputs / Formularios

**Label:**
```tsx
<Text style={{ color: '#999', fontSize: 11, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
  Nombre del campo
</Text>
```

**Campo con ícono:**
```tsx
<View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', borderRadius: 14, borderWidth: 1, borderColor: '#2E2E2E', paddingHorizontal: 14 }}>
  <Ionicons name="person-outline" size={18} color="#666" style={{ marginRight: 10 }} />
  <TextInput
    placeholder="..." placeholderTextColor="#444"
    style={{ flex: 1, color: '#F5F5F5', fontSize: 15, paddingVertical: 14 }}
  />
</View>
```

### Badges / Pills

```tsx
// Comprador (naranja)
<View style={{ backgroundColor: 'rgba(255,107,43,0.12)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,107,43,0.25)', paddingHorizontal: 10, paddingVertical: 4 }}>
  <Text style={{ color: '#FF6B2B', fontSize: 11, fontWeight: '700' }}>Comprador</Text>
</View>

// Vendedor (ámbar)
<View style={{ backgroundColor: 'rgba(255,184,48,0.12)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,184,48,0.3)', paddingHorizontal: 10, paddingVertical: 4 }}>
  <Text style={{ color: '#FFB830', fontSize: 11, fontWeight: '700' }}>Vendedor</Text>
</View>

// Neutro
<View style={{ backgroundColor: '#1A1A1A', borderRadius: 20, borderWidth: 1, borderColor: '#2E2E2E', paddingHorizontal: 10, paddingVertical: 4 }}>
  <Text style={{ color: '#555', fontSize: 11 }}>Paso 5</Text>
</View>
```

### Botón destructivo (logout, eliminar)

```tsx
<TouchableOpacity
  onPress={...}
  activeOpacity={0.8}
  style={{
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(255,77,109,0.08)',
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,77,109,0.2)',
    paddingVertical: 14,
  }}
>
  <Ionicons name="log-out-outline" size={18} color="#FF4D6D" />
  <Text style={{ color: '#FF4D6D', fontWeight: '700', fontSize: 14 }}>Cerrar sesión</Text>
</TouchableOpacity>
```

### Estado de error

```tsx
<View style={{
  flexDirection: 'row', alignItems: 'center',
  backgroundColor: 'rgba(255,77,109,0.1)',
  borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,77,109,0.3)',
  padding: 12, gap: 8,
}}>
  <Ionicons name="alert-circle-outline" size={16} color="#FF4D6D" />
  <Text style={{ color: '#FF4D6D', fontSize: 13, flex: 1 }}>{mensaje}</Text>
</View>
```

### Tipografía implementada

| Uso | fontSize | fontWeight | color | extras |
|---|---|---|---|---|
| Título hero (pantalla) | 26–36 | `'800'` | `#F5F5F5` | `letterSpacing: -0.3` |
| Título de card | 15–17 | `'700'` | `#F5F5F5` | — |
| Subtítulo / descripción | 12–13 | `'400'` | `#666` | — |
| Label de campo | 11 | `'600'` | `#999` | `letterSpacing: 1.5, textTransform: 'uppercase'` |
| Header de sección | 11 | `'600'` | `#555` | `letterSpacing: 2, textTransform: 'uppercase'` |
| Precio / highlight | 16–20 | `'800'` | `#FFB830` | — |
| Texto terciario / hint | 11–12 | `'400'` | `#333`–`#444` | — |

### Tab bars

```tsx
tabBarStyle: {
  backgroundColor: '#0F0F0F',
  borderTopColor: '#1A1A1A',
  borderTopWidth: 1,
  paddingBottom: 6, paddingTop: 6,
  height: 64,
},
tabBarActiveTintColor: '#FF6B2B',   // Comprador
// tabBarActiveTintColor: '#FFB830', // Vendedor
tabBarInactiveTintColor: '#444',
tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
```

Íconos de tabs (`nombre-outline` inactivo / `nombre` activo):
```tsx
tabBarIcon: ({ focused, color }) => (
  <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
)
```

### Spacing estándar

| Concepto | Valor |
|---|---|
| Padding horizontal de pantalla | `20px` |
| Padding interno de card | `16–24px` |
| Gap entre secciones | `24px` |
| Gap entre ítems de lista | `10–12px` |
| Border radius card | `16–20px` |
| Border radius card destacada | `24–28px` |
| Border radius botón primario | `16–18px` |
| Border radius input | `14px` |
| Border radius badge/pill | `20px` (full) |
| `paddingTop` de header (debajo de status bar) | `56px` |

### Íconos — Referencia rápida (Ionicons)

```
Storefront/mercado   → storefront / storefront-outline
Inicio               → home / home-outline
Buscar               → search / search-outline
Carrito              → cart / cart-outline
Chat                 → chatbubbles / chatbubbles-outline
Perfil               → person / person-outline
Publicar             → add-circle / add-circle-outline
Mis ventas           → cube / cube-outline
Admin / shield       → shield-checkmark / shield-checkmark-outline
Logout               → log-out-outline
Error                → alert-circle-outline
Éxito                → checkmark-circle / checkmark-circle-outline
Matrícula            → card-outline
Contraseña           → lock-closed-outline
Nombre               → person-outline
Ubicación            → location-outline
Escuela              → school-outline
Precio/dinero        → cash-outline
Categoría/tag        → pricetag-outline
Imagen               → image-outline
Cámara               → camera-outline
Favorito             → heart / heart-outline
Compartir            → share-social-outline
Notificación         → notifications / notifications-outline
Estadísticas         → bar-chart / bar-chart-outline
Usuarios             → people / people-outline
Reportes             → trending-up-outline
```
