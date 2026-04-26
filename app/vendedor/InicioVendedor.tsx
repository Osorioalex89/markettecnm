import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, RefreshControl, ActivityIndicator,
  TouchableOpacity, Modal, TextInput, Image, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import {
  fetchMisProductos, editarProducto, eliminarProducto,
  type ProductoConVendedor,
} from '../../services/productosService';

const CATEGORIAS = ['Electrónica', 'Útiles', 'Libros', 'Accesorios', 'Ropa', 'Alimentos', 'Servicios'];

function formatPrecio(precio: number): string {
  return `$${precio.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`;
}

// ── Edit modal ────────────────────────────────────────────────────────────────

type EditModalProps = {
  producto: ProductoConVendedor;
  vendedorId: string;
  visible: boolean;
  onClose: () => void;
  onGuardado: () => void;
};

function EditarProductoModal({ producto, vendedorId, visible, onClose, onGuardado }: EditModalProps) {
  const insets = useSafeAreaInsets();
  const [nombre, setNombre] = useState(producto.nombre);
  const [descripcion, setDescripcion] = useState(producto.descripcion ?? '');
  const [precio, setPrecio] = useState(String(producto.precio));
  const [stock, setStock] = useState(String(producto.stock ?? 1));
  const [categoria, setCategoria] = useState(producto.categoria ?? '');
  const [imagenUri, setImagenUri] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Reset form when a different product is opened
  useEffect(() => {
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion ?? '');
    setPrecio(String(producto.precio));
    setStock(String(producto.stock ?? 1));
    setCategoria(producto.categoria ?? '');
    setImagenUri(null);
  }, [producto.id]);

  async function seleccionarImagen() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) setImagenUri(result.assets[0].uri);
  }

  async function handleGuardar() {
    if (!nombre.trim()) return Alert.alert('', 'Escribe el nombre del producto');
    if (!precio || isNaN(Number(precio)) || Number(precio) <= 0)
      return Alert.alert('', 'Ingresa un precio válido');
    if (!stock || isNaN(Number(stock)) || Number(stock) < 0)
      return Alert.alert('', 'Ingresa la cantidad disponible');
    if (!categoria) return Alert.alert('', 'Selecciona una categoría');

    setGuardando(true);
    try {
      await editarProducto({
        id: producto.id,
        vendedorId,
        nombre,
        descripcion,
        precio: Number(precio),
        categoria,
        stock: Number(stock),
        imagenUri: imagenUri ?? undefined,
      });
      onGuardado();
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  }

  const imagenMostrada = imagenUri ?? producto.imagen_url ?? null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#0A0A0A' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <LinearGradient
          colors={['#1C0A00', '#0A0A0A']}
          style={{ paddingTop: insets.top + 16, paddingBottom: 20, paddingHorizontal: 20 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: '#F5F5F5', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 }}>
                Editar producto
              </Text>
              <Text style={{ color: '#666', fontSize: 13, marginTop: 2 }} numberOfLines={1}>
                {producto.nombre}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#2A2A2A',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Ionicons name="close" size={18} color="#666" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48, gap: 18 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Imagen */}
          <TouchableOpacity onPress={seleccionarImagen} activeOpacity={0.8}>
            <View style={{
              height: 150, backgroundColor: '#141414', borderRadius: 18,
              borderWidth: 1, borderColor: imagenUri ? 'rgba(255,184,48,0.4)' : '#2E2E2E',
              alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
              {imagenMostrada ? (
                <>
                  <Image source={{ uri: imagenMostrada }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  <View style={{
                    position: 'absolute', bottom: 8, right: 8,
                    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 9, padding: 6,
                    flexDirection: 'row', alignItems: 'center', gap: 4,
                  }}>
                    <Ionicons name="pencil-outline" size={12} color="#FFB830" />
                    <Text style={{ color: '#FFB830', fontSize: 11, fontWeight: '600' }}>Cambiar</Text>
                  </View>
                </>
              ) : (
                <View style={{ alignItems: 'center', gap: 6 }}>
                  <Ionicons name="image-outline" size={32} color="#444" />
                  <Text style={{ color: '#555', fontSize: 13 }}>Toca para agregar foto</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Nombre */}
          <View>
            <Text style={{ color: '#666', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 }}>
              NOMBRE *
            </Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              maxLength={80}
              placeholderTextColor="#333"
              style={{
                backgroundColor: '#141414', borderRadius: 14, borderWidth: 1, borderColor: '#2A2A2A',
                paddingHorizontal: 16, paddingVertical: 14, color: '#F5F5F5', fontSize: 15,
              }}
            />
          </View>

          {/* Descripción */}
          <View>
            <Text style={{ color: '#666', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 }}>
              DESCRIPCIÓN
            </Text>
            <TextInput
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Describe tu producto..."
              placeholderTextColor="#333"
              multiline
              numberOfLines={3}
              maxLength={300}
              style={{
                backgroundColor: '#141414', borderRadius: 14, borderWidth: 1, borderColor: '#2A2A2A',
                paddingHorizontal: 16, paddingVertical: 14, color: '#F5F5F5', fontSize: 15,
                textAlignVertical: 'top', minHeight: 80,
              }}
            />
          </View>

          {/* Precio + Stock */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#666', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 }}>
                PRECIO ($) *
              </Text>
              <TextInput
                value={precio}
                onChangeText={setPrecio}
                keyboardType="decimal-pad"
                style={{
                  backgroundColor: '#141414', borderRadius: 14, borderWidth: 1, borderColor: '#2A2A2A',
                  paddingHorizontal: 16, paddingVertical: 14,
                  color: '#FFB830', fontSize: 20, fontWeight: '800',
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#666', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 }}>
                STOCK *
              </Text>
              <TextInput
                value={stock}
                onChangeText={setStock}
                keyboardType="number-pad"
                style={{
                  backgroundColor: '#141414', borderRadius: 14, borderWidth: 1, borderColor: '#2A2A2A',
                  paddingHorizontal: 16, paddingVertical: 14, color: '#F5F5F5', fontSize: 15,
                }}
              />
            </View>
          </View>

          {/* Categoría */}
          <View>
            <Text style={{ color: '#666', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 }}>
              CATEGORÍA *
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIAS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategoria(cat)}
                  activeOpacity={0.75}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1,
                    backgroundColor: categoria === cat ? 'rgba(255,184,48,0.12)' : '#141414',
                    borderColor: categoria === cat ? 'rgba(255,184,48,0.45)' : '#2A2A2A',
                  }}
                >
                  <Text style={{
                    color: categoria === cat ? '#FFB830' : '#555', fontSize: 13,
                    fontWeight: categoria === cat ? '700' : '500',
                  }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Guardar */}
          <TouchableOpacity onPress={handleGuardar} disabled={guardando} activeOpacity={0.85} style={{ marginTop: 4 }}>
            <LinearGradient
              colors={guardando ? ['#2A2A2A', '#2A2A2A'] : ['#FFB830', '#FF6B2B']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 16, paddingVertical: 16,
                alignItems: 'center', justifyContent: 'center',
                flexDirection: 'row', gap: 8,
              }}
            >
              {guardando ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#0A0A0A" />
                  <Text style={{ color: '#0A0A0A', fontSize: 16, fontWeight: '800' }}>
                    Guardar cambios
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────

function MiProductoCard({
  producto,
  onEditar,
  onEliminar,
}: {
  producto: ProductoConVendedor;
  onEditar: () => void;
  onEliminar: () => void;
}) {
  const stockBajo = (producto.stock ?? 0) <= 1;
  return (
    <View style={{
      backgroundColor: '#141414', borderRadius: 18,
      borderWidth: 1, borderColor: '#2E2E2E',
      overflow: 'hidden', marginBottom: 10,
    }}>
      <LinearGradient
        colors={['#FFD060', '#FFB830', 'transparent']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ height: 2 }}
      />
      <View style={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {/* Thumbnail */}
        {producto.imagen_url ? (
          <Image
            source={{ uri: producto.imagen_url }}
            style={{ width: 48, height: 48, borderRadius: 12 }}
            resizeMode="cover"
          />
        ) : (
          <View style={{
            width: 48, height: 48, borderRadius: 12,
            backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="cube-outline" size={22} color="#FFB830" />
          </View>
        )}

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#F5F5F5', fontSize: 14, fontWeight: '700' }} numberOfLines={1}>
            {producto.nombre}
          </Text>
          <Text style={{ color: '#555', fontSize: 12, marginTop: 2 }}>
            {producto.categoria ?? 'Sin categoría'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <Text style={{ color: '#FFB830', fontSize: 15, fontWeight: '800' }}>
              {formatPrecio(Number(producto.precio))}
            </Text>
            <View style={{
              backgroundColor: stockBajo ? 'rgba(255,77,109,0.1)' : 'rgba(77,255,166,0.1)',
              borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2,
              borderWidth: 1,
              borderColor: stockBajo ? 'rgba(255,77,109,0.25)' : 'rgba(77,255,166,0.25)',
            }}>
              <Text style={{ color: stockBajo ? '#FF4D6D' : '#4DFFA6', fontSize: 10, fontWeight: '600' }}>
                Stock: {producto.stock ?? 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Acciones */}
        <View style={{ gap: 8 }}>
          <TouchableOpacity
            onPress={onEditar}
            activeOpacity={0.75}
            style={{
              width: 32, height: 32, borderRadius: 10,
              backgroundColor: 'rgba(255,184,48,0.12)',
              borderWidth: 1, borderColor: 'rgba(255,184,48,0.3)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="pencil-outline" size={15} color="#FFB830" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onEliminar}
            activeOpacity={0.75}
            style={{
              width: 32, height: 32, borderRadius: 10,
              backgroundColor: 'rgba(255,77,109,0.1)',
              borderWidth: 1, borderColor: 'rgba(255,77,109,0.25)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Ionicons name="trash-outline" size={15} color="#FF4D6D" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function InicioVendedor() {
  const { usuario } = useAuthStore();
  const [productos, setProductos] = useState<ProductoConVendedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [editando, setEditando] = useState<ProductoConVendedor | null>(null);

  const cargar = useCallback(async (esRefresh = false) => {
    if (!usuario?.id) return;
    if (esRefresh) setRefrescando(true);
    else setCargando(true);
    try {
      const data = await fetchMisProductos(usuario.id);
      setProductos(data);
    } catch {
      setProductos([]);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [usuario?.id]);

  useEffect(() => { cargar(); }, [cargar]);

  function handleEliminar(producto: ProductoConVendedor) {
    Alert.alert(
      'Eliminar producto',
      `¿Quieres eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarProducto(producto.id);
              setProductos((prev) => prev.filter((p) => p.id !== producto.id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          },
        },
      ],
    );
  }

  const nombre = usuario?.nombre?.split(' ')[0] ?? 'Vendedor';
  const totalProductos = productos.length;
  const valorInventario = productos.reduce((sum, p) => sum + Number(p.precio) * (p.stock ?? 0), 0);
  const sinStock = productos.filter((p) => (p.stock ?? 0) === 0).length;

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#0A0A0A' }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => cargar(true)}
            tintColor="#FFB830"
            colors={['#FFB830']}
          />
        }
      >
        {/* Glow ambiental */}
        <LinearGradient
          colors={['rgba(255,184,48,0.08)', 'transparent']}
          start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 220 }}
          pointerEvents="none"
        />

        {/* Header */}
        <LinearGradient
          colors={['#1C0A00', '#0A0A0A']}
          start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
          style={{ paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: '#555', fontSize: 11, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                Mi tienda
              </Text>
              <Text style={{ color: '#F5F5F5', fontSize: 26, fontWeight: '800', letterSpacing: -0.3, marginTop: 2 }}>
                Hola, {nombre}
              </Text>
            </View>
            <LinearGradient
              colors={['#FFD060', '#FFB830', '#E09020']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="cube" size={20} color="#fff" />
            </LinearGradient>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, paddingBottom: 32 }}>
          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
            {[
              { label: 'Productos', value: String(totalProductos), icon: 'cube-outline' as keyof typeof Ionicons.glyphMap, color: '#FFB830' },
              { label: 'Sin stock', value: String(sinStock), icon: 'alert-circle-outline' as keyof typeof Ionicons.glyphMap, color: '#FF4D6D' },
              { label: 'Valor total', value: formatPrecio(valorInventario), icon: 'cash-outline' as keyof typeof Ionicons.glyphMap, color: '#4DFFA6' },
            ].map((stat) => (
              <View key={stat.label} style={{
                flex: 1, backgroundColor: '#141414', borderRadius: 16,
                borderWidth: 1, borderColor: '#2E2E2E', padding: 12, alignItems: 'center', gap: 4,
              }}>
                <Ionicons name={stat.icon} size={16} color={stat.color} />
                <Text style={{ color: '#F5F5F5', fontSize: 15, fontWeight: '800' }}>{stat.value}</Text>
                <Text style={{ color: '#555', fontSize: 10 }}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Mis productos */}
          <Text style={{
            color: '#555', fontSize: 11, fontWeight: '600',
            letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12,
          }}>
            Mis publicaciones
          </Text>

          {cargando && (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator color="#FFB830" size="large" />
            </View>
          )}

          {!cargando && productos.length === 0 && (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <Ionicons name="cube-outline" size={48} color="#2E2E2E" />
              <Text style={{ color: '#444', fontSize: 15, fontWeight: '600', marginTop: 16 }}>
                Aún no tienes productos
              </Text>
              <Text style={{ color: '#333', fontSize: 13, marginTop: 6 }}>
                Publica tu primer artículo en la pestaña Publicar
              </Text>
            </View>
          )}

          {!cargando && productos.map((p) => (
            <MiProductoCard
              key={p.id}
              producto={p}
              onEditar={() => setEditando(p)}
              onEliminar={() => handleEliminar(p)}
            />
          ))}
        </View>
      </ScrollView>

      {editando && (
        <EditarProductoModal
          producto={editando}
          vendedorId={usuario!.id}
          visible={!!editando}
          onClose={() => setEditando(null)}
          onGuardado={() => cargar()}
        />
      )}
    </>
  );
}
