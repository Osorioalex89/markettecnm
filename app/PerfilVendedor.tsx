import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ListRenderItemInfo } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { useCarritoStore } from '../store/carritoStore';
import { useFavoritosStore } from '../store/favoritosStore';
import { useTheme } from '../hooks/useTheme';
import { useThemeStore } from '../store/themeStore';
import { fetchMisProductos, type ProductoConVendedor } from '../services/productosService';
import { obtenerOCrearConversacion } from '../services/chatService';
import { fetchRatingVendedor, type RatingResumen } from '../services/calificacionesService';
import ProductCard from '../components/ProductCard';
import ProductoDetalle from '../components/ProductoDetalle';
import StarRating from '../components/StarRating';

type RouteParams = {
  PerfilVendedor: { vendedorId: string; nombreVendedor: string };
};

export default function PerfilVendedor() {
  const { usuario } = useAuthStore();
  const { agregarItem } = useCarritoStore();
  const { toggleFavorito, esFavorito } = useFavoritosStore();
  const t = useTheme();
  const isDark = useThemeStore((s) => s.isDark);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProp<RouteParams, 'PerfilVendedor'>>();
  const { vendedorId, nombreVendedor } = route.params;

  const [productos, setProductos] = useState<ProductoConVendedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [contactandoId, setContactandoId] = useState<string | null>(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoConVendedor | null>(null);
  const [ratingVendedor, setRatingVendedor] = useState<RatingResumen | null>(null);

  useEffect(() => {
    Promise.all([
      fetchMisProductos(vendedorId),
      fetchRatingVendedor(vendedorId),
    ])
      .then(([prods, rating]) => {
        setProductos(prods);
        setRatingVendedor(rating);
      })
      .catch(() => setProductos([]))
      .finally(() => setCargando(false));
  }, [vendedorId]);

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
    />
  ), [contactandoId, handleContactar, usuario, toggleFavorito, esFavorito, agregarItem]);

  const inicial = (nombreVendedor ?? 'V').charAt(0).toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Header */}
      <LinearGradient
        colors={t.headerBg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={{
              width: 38, height: 38, borderRadius: 11,
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : t.surface2,
              borderWidth: 1, borderColor: t.border,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="chevron-back" size={20} color={t.text} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={{
              color: t.textMuted, fontSize: 11, fontWeight: '600',
              letterSpacing: 1.5, textTransform: 'uppercase',
            }}>
              Perfil del vendedor
            </Text>
            <Text style={{
              color: t.text, fontSize: 22, fontWeight: '800',
              letterSpacing: -0.3, marginTop: 2,
            }} numberOfLines={1}>
              {nombreVendedor}
            </Text>
            {ratingVendedor && ratingVendedor.total > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <StarRating value={ratingVendedor.promedio} size={13} />
                <Text style={{ color: t.textMuted, fontSize: 11 }}>
                  {ratingVendedor.promedio.toFixed(1)} · {ratingVendedor.total} reseña{ratingVendedor.total !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>

          <LinearGradient
            colors={['#34D399', '#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 44, height: 44, borderRadius: 13,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>{inicial}</Text>
          </LinearGradient>
        </View>
      </LinearGradient>

      {/* Fade */}
      <LinearGradient
        colors={isDark ? ['rgba(14,14,14,0.6)', 'transparent'] : ['rgba(0,0,0,0.04)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ height: 48 }}
        pointerEvents="none"
      />

      {cargando ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#10B981" size="large" />
        </View>
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          ListHeaderComponent={
            productos.length > 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={{ color: t.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase' }}>
                  Publicaciones
                </Text>
                <Text style={{ color: t.textMuted, fontSize: 12 }}>
                  {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
              <Ionicons name="storefront-outline" size={48} color={t.border} />
              <Text style={{ color: t.textSecondary, fontSize: 16, fontWeight: '700', textAlign: 'center', marginTop: 16 }}>
                Sin publicaciones
              </Text>
              <Text style={{ color: t.textMuted, fontSize: 13, marginTop: 8, textAlign: 'center' }}>
                Este vendedor aún no tiene productos activos
              </Text>
            </View>
          }
        />
      )}

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
      />
    </View>
  );
}
