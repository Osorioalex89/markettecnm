import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/authStore';
import { fetchProductos, type ProductoConVendedor } from '../../services/productosService';
import ProductCard from '../../components/ProductCard';
import ProductoDetalle from '../../components/ProductoDetalle';
import { useCarritoStore } from '../../store/carritoStore';
import { obtenerOCrearConversacion } from '../../services/chatService';

export default function InicioComprador() {
  const { usuario } = useAuthStore();
  const [productos, setProductos] = useState<ProductoConVendedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    setError(null);
    try {
      const data = await fetchProductos();
      setProductos(data);
    } catch {
      setError('No se pudo cargar el feed. Toca para reintentar.');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [contactandoId, setContactandoId] = useState<string | null>(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoConVendedor | null>(null);

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

  const nombre = usuario?.nombre?.split(' ')[0] ?? 'Alumno';
  const { agregarItem } = useCarritoStore();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A0A0A' }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refrescando}
          onRefresh={() => cargar(true)}
          tintColor="#FF6B2B"
          colors={['#FF6B2B']}
        />
      }
    >
      {/* Glow ambiental */}
      <LinearGradient
        colors={['rgba(255,107,43,0.10)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 220 }}
        pointerEvents="none"
      />

      {/* Header */}
      <LinearGradient
        colors={['#1C0A00', '#0A0A0A']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: '#555', fontSize: 11, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Bienvenido
            </Text>
            <Text style={{ color: '#F5F5F5', fontSize: 26, fontWeight: '800', letterSpacing: -0.3, marginTop: 2 }}>
              Hola, {nombre} 👋
            </Text>
          </View>
          <LinearGradient
            colors={['#FF8C55', '#FF6B2B', '#E05520']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 44, height: 44, borderRadius: 13,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="storefront" size={20} color="#fff" />
          </LinearGradient>
        </View>
      </LinearGradient>

      {/* Fade header→contenido */}
      <LinearGradient
        colors={['rgba(28,10,0,0.7)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ height: 48 }}
        pointerEvents="none"
      />

      <View style={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        {/* Sección header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ color: '#555', fontSize: 11, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase' }}>
            Productos disponibles
          </Text>
          {!cargando && (
            <Text style={{ color: '#444', fontSize: 12 }}>
              {productos.length} {productos.length === 1 ? 'resultado' : 'resultados'}
            </Text>
          )}
        </View>

        {/* Estados */}
        {cargando && (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <ActivityIndicator color="#FF6B2B" size="large" />
            <Text style={{ color: '#555', fontSize: 13, marginTop: 12 }}>Cargando productos...</Text>
          </View>
        )}

        {error && !cargando && (
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: 'rgba(255,77,109,0.1)',
            borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,77,109,0.25)',
            padding: 14, gap: 10,
          }}>
            <Ionicons name="alert-circle-outline" size={18} color="#FF4D6D" />
            <Text style={{ color: '#FF4D6D', fontSize: 13, flex: 1 }}>{error}</Text>
          </View>
        )}

        {!cargando && !error && productos.length === 0 && (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <Ionicons name="storefront-outline" size={48} color="#2E2E2E" />
            <Text style={{ color: '#444', fontSize: 15, fontWeight: '600', marginTop: 16 }}>
              Sin productos aún
            </Text>
            <Text style={{ color: '#333', fontSize: 13, marginTop: 6 }}>
              Sé el primero en publicar algo
            </Text>
          </View>
        )}

        {!cargando && !error && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {productos.map((p) => (
              <ProductCard
                key={p.id}
                producto={p}
                style={{ width: '48.5%', marginBottom: 12 }}
                onPress={() => setProductoSeleccionado(p)}
                onAgregarCarrito={() => agregarItem(p)}
                onContactar={() => handleContactar(p)}
                contactando={contactandoId === p.id}
              />
            ))}
          </View>
        )}
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
      />
    </ScrollView>
  );
}
