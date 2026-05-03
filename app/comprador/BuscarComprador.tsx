import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, ScrollView, FlatList, TouchableOpacity,
  ActivityIndicator, ListRenderItemInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/authStore';
import { useCarritoStore } from '../../store/carritoStore';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore } from '../../store/themeStore';
import { buscarProductos, type ProductoConVendedor } from '../../services/productosService';
import ProductCard from '../../components/ProductCard';
import ProductoDetalle from '../../components/ProductoDetalle';
import { obtenerOCrearConversacion } from '../../services/chatService';
import { useFavoritosStore } from '../../store/favoritosStore';

const CATEGORIAS = ['Todos', 'Electrónica', 'Útiles', 'Libros', 'Accesorios', 'Ropa', 'Alimentos', 'Servicios'];

type Orden = 'reciente' | 'precio_asc' | 'precio_desc';

const ORDENES: { key: Orden; label: string }[] = [
  { key: 'reciente', label: 'Reciente' },
  { key: 'precio_asc', label: '↑ Precio' },
  { key: 'precio_desc', label: '↓ Precio' },
];

export default function BuscarComprador() {
  const { usuario } = useAuthStore();
  const { agregarItem } = useCarritoStore();
  const t = useTheme();
  const isDark = useThemeStore((s) => s.isDark);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [query, setQuery] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [productos, setProductos] = useState<ProductoConVendedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [contactandoId, setContactandoId] = useState<string | null>(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoConVendedor | null>(null);

  // Filtros
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [precioMinStr, setPrecioMinStr] = useState('');
  const [precioMaxStr, setPrecioMaxStr] = useState('');
  const [soloConStock, setSoloConStock] = useState(false);
  const [ordenamiento, setOrdenamiento] = useState<Orden>('reciente');

  const { toggleFavorito, esFavorito, cargarFavoritos } = useFavoritosStore();

  useEffect(() => {
    if (usuario) cargarFavoritos(usuario.id);
  }, [usuario?.id]);

  const handleContactar = useCallback(async (producto: ProductoConVendedor) => {
    if (!usuario || contactandoId) return;
    setContactandoId(producto.id);
    try {
      const convId = await obtenerOCrearConversacion(usuario.id, producto.vendedor_id);
      navigation.navigate('ChatScreen', {
        conversacionId: convId,
        otroNombre: producto.perfiles?.nombre ?? 'Vendedor',
        otroId: producto.vendedor_id,
      });
    } catch {
      // silencioso
    } finally {
      setContactandoId(null);
    }
  }, [usuario, contactandoId, navigation]);

  const buscar = useCallback(async (q: string, cat: string) => {
    setCargando(true);
    try {
      const data = await buscarProductos(q, cat);
      setProductos(data);
    } catch {
      setProductos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    buscar(query, categoriaActiva);
  }, [categoriaActiva]);

  const handleBuscar = () => buscar(query, categoriaActiva);

  const handleLimpiar = () => {
    setQuery('');
    if (categoriaActiva === 'Todos') {
      buscar('', 'Todos');
    } else {
      setCategoriaActiva('Todos');
    }
  };

  const limpiarFiltros = () => {
    setPrecioMinStr('');
    setPrecioMaxStr('');
    setSoloConStock(false);
    setOrdenamiento('reciente');
  };

  const precioMin = precioMinStr ? parseFloat(precioMinStr) : 0;
  const precioMax = precioMaxStr ? parseFloat(precioMaxStr) : 0;
  const hayFiltrosActivos = soloConStock || precioMin > 0 || precioMax > 0 || ordenamiento !== 'reciente';

  const productosMostrados = useMemo(() => {
    let lista = [...productos];
    if (soloConStock) lista = lista.filter((p) => (p.stock ?? 0) > 0);
    if (precioMin > 0) lista = lista.filter((p) => Number(p.precio) >= precioMin);
    if (precioMax > 0) lista = lista.filter((p) => Number(p.precio) <= precioMax);
    if (ordenamiento === 'precio_asc') lista.sort((a, b) => Number(a.precio) - Number(b.precio));
    else if (ordenamiento === 'precio_desc') lista.sort((a, b) => Number(b.precio) - Number(a.precio));
    return lista;
  }, [productos, soloConStock, precioMin, precioMax, ordenamiento]);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<ProductoConVendedor>) => (
    <ProductCard
      producto={item}
      style={{ flex: 1 }}
      onPress={() => setProductoSeleccionado(item)}
      onAgregarCarrito={() => agregarItem(item)}
      onContactar={() => handleContactar(item)}
      contactando={contactandoId === item.id}
      onFavorito={() => usuario && toggleFavorito(usuario.id, item.id)}
      esFavorito={esFavorito(item.id)}
      onVerVendedor={() => navigation.navigate('PerfilVendedor', {
        vendedorId: item.vendedor_id,
        nombreVendedor: item.perfiles?.nombre ?? 'Vendedor',
      })}
    />
  ), [contactandoId, handleContactar, usuario, toggleFavorito, esFavorito, agregarItem, navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Header + filtros */}
      <LinearGradient
        colors={t.headerBg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ paddingTop: 56, paddingBottom: 4, paddingHorizontal: 20 }}
      >
        {/* Título + botón filtros */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ color: t.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.3 }}>
            Buscar
          </Text>
          <TouchableOpacity
            onPress={() => setFiltrosAbiertos(!filtrosAbiertos)}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 5,
              paddingHorizontal: 12, paddingVertical: 7,
              backgroundColor: hayFiltrosActivos ? 'rgba(16,185,129,0.15)' : t.surface2,
              borderRadius: 20, borderWidth: 1,
              borderColor: hayFiltrosActivos ? 'rgba(16,185,129,0.4)' : t.border,
            }}
          >
            <Ionicons
              name="options-outline"
              size={14}
              color={hayFiltrosActivos ? '#10B981' : t.textMuted}
            />
            <Text style={{
              color: hayFiltrosActivos ? '#10B981' : t.textMuted,
              fontSize: 12, fontWeight: '600',
            }}>
              Filtros{hayFiltrosActivos ? ' •' : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Barra de búsqueda */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: t.surface2, borderRadius: 14,
          borderWidth: 1, borderColor: t.border, paddingHorizontal: 14,
        }}>
          <Ionicons name="search-outline" size={18} color={t.textMuted} style={{ marginRight: 10 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleBuscar}
            returnKeyType="search"
            placeholder="Buscar productos..."
            placeholderTextColor={t.textMuted}
            style={{ flex: 1, color: t.text, fontSize: 15, paddingVertical: 13 }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleLimpiar} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color="#555" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros de categoría */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, marginHorizontal: -20 }}
          contentContainerStyle={{
            paddingHorizontal: 20, paddingTop: 14,
            paddingBottom: filtrosAbiertos ? 16 : 20, gap: 8,
          }}
        >
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategoriaActiva(cat)}
              activeOpacity={0.8}
              style={{ borderRadius: 20 }}
            >
              {categoriaActiva === cat ? (
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 }}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{cat}</Text>
                </LinearGradient>
              ) : (
                <View style={{
                  paddingHorizontal: 14, paddingVertical: 7,
                  backgroundColor: t.surface2,
                  borderWidth: 1, borderColor: t.border, borderRadius: 20,
                }}>
                  <Text style={{ color: t.textMuted, fontSize: 12, fontWeight: '600' }}>{cat}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Panel de filtros expandible */}
        {filtrosAbiertos && (
          <View style={{
            borderTopWidth: 1, borderTopColor: t.border,
            paddingTop: 16, paddingBottom: 16, gap: 16,
          }}>
            {/* Ordenar */}
            <View>
              <Text style={{
                color: t.textMuted, fontSize: 10, fontWeight: '700',
                letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8,
              }}>
                Ordenar
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {ORDENES.map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setOrdenamiento(key)}
                    activeOpacity={0.8}
                    style={{ borderRadius: 20 }}
                  >
                    {ordenamiento === key ? (
                      <LinearGradient
                        colors={['#10B981', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 }}
                      >
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{label}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={{
                        paddingHorizontal: 14, paddingVertical: 6,
                        backgroundColor: t.surface2,
                        borderWidth: 1, borderColor: t.border, borderRadius: 20,
                      }}>
                        <Text style={{ color: t.textMuted, fontSize: 11, fontWeight: '600' }}>{label}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Rango de precio */}
            <View>
              <Text style={{
                color: t.textMuted, fontSize: 10, fontWeight: '700',
                letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8,
              }}>
                Rango de precio
              </Text>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <View style={{
                  flex: 1, flexDirection: 'row', alignItems: 'center',
                  backgroundColor: t.surface2, borderRadius: 12,
                  borderWidth: 1, borderColor: t.border, paddingHorizontal: 10,
                }}>
                  <Text style={{ color: t.textMuted, fontSize: 13, marginRight: 4 }}>$</Text>
                  <TextInput
                    value={precioMinStr}
                    onChangeText={setPrecioMinStr}
                    placeholder="Mínimo"
                    placeholderTextColor={t.textMuted}
                    keyboardType="numeric"
                    style={{ flex: 1, color: t.text, fontSize: 13, paddingVertical: 9 }}
                  />
                </View>
                <Text style={{ color: t.textMuted, fontSize: 12 }}>—</Text>
                <View style={{
                  flex: 1, flexDirection: 'row', alignItems: 'center',
                  backgroundColor: t.surface2, borderRadius: 12,
                  borderWidth: 1, borderColor: t.border, paddingHorizontal: 10,
                }}>
                  <Text style={{ color: t.textMuted, fontSize: 13, marginRight: 4 }}>$</Text>
                  <TextInput
                    value={precioMaxStr}
                    onChangeText={setPrecioMaxStr}
                    placeholder="Máximo"
                    placeholderTextColor={t.textMuted}
                    keyboardType="numeric"
                    style={{ flex: 1, color: t.text, fontSize: 13, paddingVertical: 9 }}
                  />
                </View>
              </View>
            </View>

            {/* Solo con stock */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: t.textSecondary, fontSize: 13, fontWeight: '600' }}>
                Solo disponibles
              </Text>
              <TouchableOpacity
                onPress={() => setSoloConStock(!soloConStock)}
                activeOpacity={0.8}
                style={{
                  width: 44, height: 24, borderRadius: 12,
                  backgroundColor: soloConStock ? '#10B981' : t.surface2,
                  borderWidth: 1, borderColor: soloConStock ? '#10B981' : t.border,
                  justifyContent: 'center', paddingHorizontal: 2,
                }}
              >
                <View style={{
                  width: 18, height: 18, borderRadius: 9,
                  backgroundColor: '#fff',
                  alignSelf: soloConStock ? 'flex-end' : 'flex-start',
                  elevation: 2,
                }} />
              </TouchableOpacity>
            </View>

            {/* Limpiar filtros */}
            {hayFiltrosActivos && (
              <TouchableOpacity
                onPress={limpiarFiltros}
                activeOpacity={0.7}
                style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Ionicons name="refresh-outline" size={13} color={t.textMuted} />
                <Text style={{ color: t.textMuted, fontSize: 11, fontWeight: '600' }}>
                  Limpiar filtros
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </LinearGradient>

      {/* Fade header→contenido */}
      <LinearGradient
        colors={isDark ? ['rgba(14,14,14,0.6)', 'transparent'] : ['rgba(0,0,0,0.04)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ height: 18 }}
        pointerEvents="none"
      />

      {/* Resultados */}
      <View style={{ flex: 1 }}>
        {cargando ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#10B981" size="large" />
          </View>
        ) : (
          <FlatList
            data={productosMostrados}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={renderItem}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 }}
            columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={productosMostrados.length > 0 ? (
              <Text style={{
                color: t.textMuted, fontSize: 11, fontWeight: '600',
                letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12,
              }}>
                {productosMostrados.length} {productosMostrados.length === 1 ? 'resultado' : 'resultados'}
              </Text>
            ) : null}
            ListEmptyComponent={
              <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                <Ionicons name="search-outline" size={48} color={t.border} />
                <Text style={{ color: t.border, fontSize: 15, fontWeight: '600', marginTop: 16 }}>
                  Sin resultados
                </Text>
                <Text style={{ color: t.border, fontSize: 13, marginTop: 6 }}>
                  Intenta con otro término o categoría
                </Text>
              </View>
            }
          />
        )}

        <LinearGradient
          pointerEvents="none"
          colors={[t.bg + 'CC', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8 }}
        />
      </View>

      <ProductoDetalle
        producto={productoSeleccionado}
        visible={!!productoSeleccionado}
        onClose={() => setProductoSeleccionado(null)}
        onAgregarCarrito={productoSeleccionado ? () => {
          agregarItem(productoSeleccionado);
          setProductoSeleccionado(null);
        } : undefined}
        onContactar={productoSeleccionado ? () => handleContactar(productoSeleccionado) : undefined}
        contactando={contactandoId === productoSeleccionado?.id}
        onVerVendedor={productoSeleccionado ? () => {
          setProductoSeleccionado(null);
          navigation.navigate('PerfilVendedor', {
            vendedorId: productoSeleccionado.vendedor_id,
            nombreVendedor: productoSeleccionado.perfiles?.nombre ?? 'Vendedor',
          });
        } : undefined}
      />
    </View>
  );
}
