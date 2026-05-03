import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Image,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore } from '../../store/themeStore';
import { publicarProducto } from '../../services/productosService';

const CATEGORIAS = ['Electrónica', 'Útiles', 'Libros', 'Accesorios', 'Ropa', 'Alimentos', 'Servicios'];

export default function PublicarVendedor() {
  const { usuario } = useAuthStore();
  const t = useTheme();
  const isDark = useThemeStore((s) => s.isDark);
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
      style={{ flex: 1, backgroundColor: t.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={t.headerBg}
          style={{ paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 }}
        >
          <Text style={{ color: t.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.3 }}>
            Publicar producto
          </Text>
          <Text style={{ color: t.textMuted, fontSize: 13, marginTop: 4 }}>
            Completa los datos para poner en venta
          </Text>
        </LinearGradient>

        {/* Fade header→contenido */}
        <LinearGradient
          colors={isDark ? ['rgba(14,14,14,0.6)', 'transparent'] : ['rgba(0,0,0,0.04)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ height: 48 }}
          pointerEvents="none"
        />

        <View style={{ paddingHorizontal: 20, gap: 20 }}>
          {/* Foto */}
          <TouchableOpacity onPress={seleccionarImagen} activeOpacity={0.8}>
            <View style={{
              height: 160,
              backgroundColor: t.surface,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: imagenUri ? 'rgba(5,150,105,0.4)' : t.border,
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
                    <Ionicons name="pencil-outline" size={14} color="#059669" />
                  </View>
                </>
              ) : (
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <Ionicons name="image-outline" size={36} color={t.border} />
                  <Text style={{ color: t.textMuted, fontSize: 13 }}>Toca para agregar foto</Text>
                  <Text style={{ color: t.border, fontSize: 11 }}>Opcional · JPG, PNG, WebP · Máx. 5 MB</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Nombre */}
          <View>
            <Text style={{ color: t.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 }}>
              NOMBRE DEL PRODUCTO *
            </Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej. Calculadora científica"
              placeholderTextColor={t.border}
              maxLength={80}
              style={{
                backgroundColor: t.surface,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: t.border,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: t.text,
                fontSize: 15,
              }}
            />
          </View>

          {/* Descripción */}
          <View>
            <Text style={{ color: t.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 }}>
              DESCRIPCIÓN
            </Text>
            <TextInput
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Describe tu producto, estado, incluye detalles..."
              placeholderTextColor={t.border}
              multiline
              numberOfLines={3}
              maxLength={300}
              style={{
                backgroundColor: t.surface,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: t.border,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: t.text,
                fontSize: 15,
                textAlignVertical: 'top',
                minHeight: 90,
              }}
            />
          </View>

          {/* Precio y Stock */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 }}>
                PRECIO ($) *
              </Text>
              <TextInput
                value={precio}
                onChangeText={setPrecio}
                placeholder="0.00"
                placeholderTextColor={t.border}
                keyboardType="decimal-pad"
                style={{
                  backgroundColor: t.surface,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: t.border,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: '#059669',
                  fontSize: 20,
                  fontWeight: '800',
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 }}>
                STOCK *
              </Text>
              <TextInput
                value={stock}
                onChangeText={setStock}
                placeholder="1"
                placeholderTextColor={t.border}
                keyboardType="number-pad"
                style={{
                  backgroundColor: t.surface,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: t.border,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: t.text,
                  fontSize: 15,
                }}
              />
            </View>
          </View>

          {/* Categoría */}
          <View>
            <Text style={{ color: t.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 }}>
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
                    backgroundColor: categoria === cat ? 'rgba(5,150,105,0.12)' : t.surface,
                    borderColor: categoria === cat ? 'rgba(5,150,105,0.45)' : t.border,
                  }}
                >
                  <Text style={{
                    color: categoria === cat ? '#059669' : t.textMuted,
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
              colors={cargando ? ['#2A2A2A', '#2A2A2A'] : ['#10B981', '#059669']}
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