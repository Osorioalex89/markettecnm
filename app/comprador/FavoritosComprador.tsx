import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/authStore';
import { useCarritoStore } from '../../store/carritoStore';
import { useFavoritosStore } from '../../store/favoritosStore';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore } from '../../store/themeStore';
import { fetchProductos, type ProductoConVendedor } from '../../services/productosService';
import { obtenerOCrearConversacion } from '../../services/chatService';
import ProductCard from '../../components/ProductCard';
import ProductoDetalle from '../../components/ProductoDetalle';

export default function FavoritosComprador() {
  const { usuario } = useAuthStore();
  const { agregarItem } = useCarritoStore();
  const { favoritos, cargarFavoritos, toggleFavorito, esFavorito } = useFavoritosStore();
  const t = useTheme();
  const isDark = useThemeStore((s) => s.isDark);

  const [todos, setTodos] = useState<ProductoConVendedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoConVendedor | null>(null);
  const [contactandoId, setContactandoId] = useState<string | null>(null);

  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const cargar = useCallback(async (esRefresh = false) => {
    if (!usuario) return;
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    try {
      const [prods] = await Promise.all([
        fetchProductos(),
        cargarFavoritos(usuario.id),
      ]);
      setTodos(prods);
    } catch {
      // silencioso
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [usuario, cargarFavoritos]);

  useEffect(() => { cargar(); }, [cargar]);

  // Filtrar solo los productos que están en favoritos
  const productosFavoritos = todos.filter((p) => favoritos.has(p.id));

  const handleToggleFavorito = useCallback((productoId: string) => {
    if (!usuario) return;
    toggleFavorito(usuario.id, productoId);
  }, [usuario, toggleFavorito]);

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

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Glow ambiental */}
      <LinearGradient
        colors={['rgba(16,185,129,0.08)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200 }}
        pointerEvents="none"
      />

      {/* Header */}
      <LinearGradient
        colors={t.headerBg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{
              color: t.textMuted, fontSize: 11, fontWeight: '600',
              letterSpacing: 1.5, textTransform: 'uppercase',
            }}>
              Colección
            </Text>
            <Text style={{
              color: t.text, fontSize: 26, fontWeight: '800',
              letterSpacing: -0.3, marginTop: 2,
            }}>
              Tus favoritos
            </Text>
          </View>
          <LinearGradient
            colors={['#34D399', '#10B981']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 44, height: 44, borderRadius: 13,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="heart" size={20} color="#fff" />
          </LinearGradient>
        </View>
      </LinearGradient>

      {/* Fade header→contenido */}
      <LinearGradient
        colors={isDark ? ['rgba(14,14,14,0.6)', 'transparent'] : ['rgba(0,0,0,0.04)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ height: 48 }}
        pointerEvents="none"
      />

      {/* Estado cargando */}
      {cargando && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#10B981" size="large" />
          <Text style={{ color: t.textMuted, fontSize: 13, marginTop: 12 }}>Cargando favoritos...</Text>
        </View>
      )}

      {/* Lista */}
      {!cargando && (
        <FlatList
          data={productosFavoritos}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 100,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={() => cargar(true)}
              tintColor="#10B981"
              colors={['#10B981']}
            />
          }
          ListHeaderComponent={
            productosFavoritos.length > 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={{ color: t.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase' }}>
                  Guardados
                </Text>
                <Text style={{ color: t.textMuted, fontSize: 12 }}>
                  {productosFavoritos.length} {productosFavoritos.length === 1 ? 'producto' : 'productos'}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
              <View style={{
                width: 72, height: 72, borderRadius: 22,
                backgroundColor: 'rgba(255,77,109,0.08)',
                borderWidth: 1, borderColor: 'rgba(255,77,109,0.15)',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>
                <Ionicons name="heart-outline" size={32} color="rgba(255,77,109,0.4)" />
              </View>
              <Text style={{ color: t.textSecondary, fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
                Aún no tienes favoritos
              </Text>
              <Text style={{ color: t.textMuted, fontSize: 13, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
                {'Toca el ♥ en cualquier producto\npara guardarlo aquí'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ProductCard
              producto={item}
              style={{ flex: 1 }}
              onPress={() => setProductoSeleccionado(item)}
              onAgregarCarrito={() => agregarItem(item)}
              onContactar={() => handleContactar(item)}
              contactando={contactandoId === item.id}
              onFavorito={() => handleToggleFavorito(item.id)}
              esFavorito={esFavorito(item.id)}
              onVerVendedor={() => navigation.navigate('PerfilVendedor', {
                vendedorId: item.vendedor_id,
                nombreVendedor: item.perfiles?.nombre ?? 'Vendedor',
              })}
            />
          )}
        />
      )}

      {/* Modal detalle */}
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
