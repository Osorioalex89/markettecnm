import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, FlatList, TouchableOpacity,
  ActivityIndicator, ListRenderItemInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../store/authStore';
import { buscarProductos, type ProductoConVendedor } from '../../services/productosService';
import ProductCard from '../../components/ProductCard';
import ProductoDetalle from '../../components/ProductoDetalle';
import { obtenerOCrearConversacion } from '../../services/chatService';

const CATEGORIAS = ['Todos', 'Electrónica', 'Útiles', 'Libros', 'Accesorios', 'Ropa', 'Alimentos', 'Servicios'];

export default function BuscarComprador() {
  const { usuario } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [query, setQuery] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [productos, setProductos] = useState<ProductoConVendedor[]>([]);
  const [cargando, setCargando] = useState(true);
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

  const renderItem = useCallback(({ item }: ListRenderItemInfo<ProductoConVendedor>) => (
    <ProductCard
      producto={item}
      style={{ flex: 1 }}
      onPress={() => setProductoSeleccionado(item)}
      onContactar={() => handleContactar(item)}
      contactando={contactandoId === item.id}
    />
  ), [contactandoId, handleContactar]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      {/* Header + filtros dentro del mismo gradiente */}
      <LinearGradient
        colors={['#1C0A00', '#0A0A0A']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ paddingTop: 56, paddingBottom: 4, paddingHorizontal: 20 }}
      >
        <Text style={{ color: '#F5F5F5', fontSize: 26, fontWeight: '800', letterSpacing: -0.3, marginBottom: 16 }}>
          Buscar
        </Text>

        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#1E1E1E', borderRadius: 14,
          borderWidth: 1, borderColor: '#2E2E2E', paddingHorizontal: 14,
        }}>
          <Ionicons name="search-outline" size={18} color="#666" style={{ marginRight: 10 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleBuscar}
            returnKeyType="search"
            placeholder="Buscar productos..."
            placeholderTextColor="#444"
            style={{ flex: 1, color: '#F5F5F5', fontSize: 15, paddingVertical: 13 }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleLimpiar} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color="#555" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros dentro del gradiente para continuidad visual */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0, marginHorizontal: -20 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 20, gap: 8 }}
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
                  colors={['#FF6B2B', '#E05520']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 }}
                >
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{cat}</Text>
                </LinearGradient>
              ) : (
                <View style={{
                  paddingHorizontal: 14, paddingVertical: 7,
                  backgroundColor: '#1E1E1E',
                  borderWidth: 1, borderColor: '#2E2E2E', borderRadius: 20,
                }}>
                  <Text style={{ color: '#666', fontSize: 12, fontWeight: '600' }}>{cat}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Fade header→contenido */}
      <LinearGradient
        colors={['rgba(28,10,0,0.7)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ height: 48 }}
        pointerEvents="none"
      />

      {/* Área de resultados */}
      <View style={{ flex: 1 }}>
        {cargando ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#FF6B2B" size="large" />
          </View>
        ) : (
          <FlatList
            data={productos}
            keyExtractor={(item) => item.id}
            numColumns={2}
            renderItem={renderItem}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 }}
            columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={productos.length > 0 ? (
              <Text style={{
                color: '#555', fontSize: 11, fontWeight: '600',
                letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12,
              }}>
                {productos.length} {productos.length === 1 ? 'resultado' : 'resultados'}
              </Text>
            ) : null}
            ListEmptyComponent={
              <View style={{ paddingVertical: 60, alignItems: 'center' }}>
                <Ionicons name="search-outline" size={48} color="#2E2E2E" />
                <Text style={{ color: '#444', fontSize: 15, fontWeight: '600', marginTop: 16 }}>
                  Sin resultados
                </Text>
                <Text style={{ color: '#333', fontSize: 13, marginTop: 6 }}>
                  Intenta con otro término o categoría
                </Text>
              </View>
            }
          />
        )}

        {/* Gradiente de fade sobre los primeros productos */}
        <LinearGradient
          pointerEvents="none"
          colors={['#0A0A0A', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 12 }}
        />
      </View>
      <ProductoDetalle
        producto={productoSeleccionado}
        visible={!!productoSeleccionado}
        onClose={() => setProductoSeleccionado(null)}
        onContactar={productoSeleccionado ? () => handleContactar(productoSeleccionado) : undefined}
        contactando={contactandoId === productoSeleccionado?.id}
      />
    </View>
  );
}