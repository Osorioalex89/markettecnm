import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Image,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { publicarProducto } from '../../services/productosService';

const CATEGORIAS = ['Electrónica', 'Útiles', 'Libros', 'Accesorios', 'Ropa', 'Alimentos', 'Servicios'];

export default function PublicarVendedor() {
  const { usuario } = useAuthStore();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagenUri, setImagenUri] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function seleccionarImagen() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para agregar una foto');
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

  function resetForm() {
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setStock('');
    setCategoria('');
    setImagenUri(null);
  }

  async function handlePublicar() {
    if (!nombre.trim()) return Alert.alert('', 'Escribe el nombre del producto');
    if (!precio || isNaN(Number(precio)) || Number(precio) <= 0)
      return Alert.alert('', 'Ingresa un precio válido');
    if (!stock || isNaN(Number(stock)) || Number(stock) < 1)
      return Alert.alert('', 'Ingresa la cantidad disponible');
    if (!categoria) return Alert.alert('', 'Selecciona una categoría');

    setCargando(true);
    try {
      await publicarProducto({
        vendedorId: usuario!.id,
        nombre,
        descripcion,
        precio: Number(precio),
        categoria,
        stock: Number(stock),
        imagenUri: imagenUri ?? undefined,
      });
      Alert.alert('¡Listo!', 'Tu producto fue publicado correctamente', [
        { text: 'OK', onPress: resetForm },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo publicar el producto');
    } finally {
      setCargando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0A0A0A' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['#1C0A00', '#0A0A0A']}
          style={{ paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 }}
        >
          <Text style={{ color: '#F5F5F5', fontSize: 26, fontWeight: '800', letterSpacing: -0.3 }}>
            Publicar producto
          </Text>
          <Text style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
            Completa los datos para poner en venta
          </Text>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, gap: 20 }}>
          {/* Foto */}
          <TouchableOpacity onPress={seleccionarImagen} activeOpacity={0.8}>
            <View style={{
              height: 160,
              backgroundColor: '#141414',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: imagenUri ? 'rgba(255,184,48,0.4)' : '#2E2E2E',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {imagenUri ? (
                <>
                  <Image source={{ uri: imagenUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  <View style={{
                    position: 'absolute', bottom: 10, right: 10,
                    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10, padding: 6,
                  }}>
                    <Ionicons name="pencil-outline" size={14} color="#FFB830" />
                  </View>
                </>
              ) : (
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <Ionicons name="image-outline" size={36} color="#444" />
                  <Text style={{ color: '#555', fontSize: 13 }}>Toca para agregar foto</Text>
                  <Text style={{ color: '#3A3A3A', fontSize: 11 }}>Opcional · JPG, PNG, WebP · Máx. 5 MB</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Nombre */}
          <View>
            <Text style={{ color: '#666', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 }}>
              NOMBRE DEL PRODUCTO *
            </Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej. Calculadora científica"
              placeholderTextColor="#333"
              maxLength={80}
              style={{
                backgroundColor: '#141414',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#2A2A2A',
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: '#F5F5F5',
                fontSize: 15,
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
              placeholder="Describe tu producto, estado, incluye detalles..."
              placeholderTextColor="#333"
              multiline
              numberOfLines={3}
              maxLength={300}
              style={{
                backgroundColor: '#141414',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: '#2A2A2A',
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: '#F5F5F5',
                fontSize: 15,
                textAlignVertical: 'top',
                minHeight: 90,
              }}
            />
          </View>

          {/* Precio y Stock */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#666', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 }}>
                PRECIO ($) *
              </Text>
              <TextInput
                value={precio}
                onChangeText={setPrecio}
                placeholder="0.00"
                placeholderTextColor="#333"
                keyboardType="decimal-pad"
                style={{
                  backgroundColor: '#141414',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#2A2A2A',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: '#FFB830',
                  fontSize: 20,
                  fontWeight: '800',
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
                placeholder="1"
                placeholderTextColor="#333"
                keyboardType="number-pad"
                style={{
                  backgroundColor: '#141414',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: '#2A2A2A',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: '#F5F5F5',
                  fontSize: 15,
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
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    borderRadius: 20,
                    borderWidth: 1,
                    backgroundColor: categoria === cat ? 'rgba(255,184,48,0.12)' : '#141414',
                    borderColor: categoria === cat ? 'rgba(255,184,48,0.45)' : '#2A2A2A',
                  }}
                >
                  <Text style={{
                    color: categoria === cat ? '#FFB830' : '#555',
                    fontSize: 13,
                    fontWeight: categoria === cat ? '700' : '500',
                  }}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Botón publicar */}
          <TouchableOpacity onPress={handlePublicar} disabled={cargando} activeOpacity={0.85} style={{ marginTop: 4 }}>
            <LinearGradient
              colors={cargando ? ['#2A2A2A', '#2A2A2A'] : ['#FFB830', '#FF6B2B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
              }}
            >
              {cargando ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={20} color="#0A0A0A" />
                  <Text style={{ color: '#0A0A0A', fontSize: 16, fontWeight: '800' }}>
                    Publicar producto
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}