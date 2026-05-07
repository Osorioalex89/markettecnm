import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Image,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore } from '../../store/themeStore';
import { publicarProducto } from '../../services/productosService';

const CATEGORIAS = ['Electrónica', 'Útiles', 'Libros', 'Accesorios', 'Ropa', 'Alimentos', 'Servicios'];

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function formatFechaLimite(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MESES[m - 1]} ${y}`;
}

export default function PublicarVendedor() {
  const { usuario } = useAuthStore();
  const t = useTheme();
  const isDark = useThemeStore((s) => s.isDark);
  const insets = useSafeAreaInsets();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagenUri, setImagenUri] = useState<string | null>(null);
  const [fechaLimite, setFechaLimite] = useState<string | null>(null);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mesVista, setMesVista] = useState(() => { const d = new Date(); d.setDate(1); return d; });
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
    setFechaLimite(null);
  }

  function navegarMes(dir: 1 | -1) {
    setMesVista((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + dir);
      return d;
    });
  }

  function renderCalendario() {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const year = mesVista.getFullYear();
    const month = mesVista.getMonth();
    const totalDias = new Date(year, month + 1, 0).getDate();
    const primerDia = new Date(year, month, 1).getDay();
    const celdas: (number | null)[] = [...Array(primerDia).fill(null), ...Array.from({ length: totalDias }, (_, i) => i + 1)];
    while (celdas.length % 7 !== 0) celdas.push(null);

    return (
      <Modal visible={mostrarCalendario} transparent animationType="slide" onRequestClose={() => setMostrarCalendario(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} activeOpacity={1} onPress={() => setMostrarCalendario(false)} />
        <View style={{ backgroundColor: t.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: insets.bottom + 20 }}>
          {/* Nav mes */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <TouchableOpacity onPress={() => navegarMes(-1)} style={{ padding: 8 }}>
              <Ionicons name="chevron-back" size={20} color={t.text} />
            </TouchableOpacity>
            <Text style={{ color: t.text, fontSize: 15, fontWeight: '700' }}>
              {MESES[month]} {year}
            </Text>
            <TouchableOpacity onPress={() => navegarMes(1)} style={{ padding: 8 }}>
              <Ionicons name="chevron-forward" size={20} color={t.text} />
            </TouchableOpacity>
          </View>

          {/* Cabecera días */}
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            {DIAS_SEMANA.map((d) => (
              <Text key={d} style={{ flex: 1, textAlign: 'center', color: t.textMuted, fontSize: 11, fontWeight: '600' }}>{d}</Text>
            ))}
          </View>

          {/* Grid */}
          {Array.from({ length: celdas.length / 7 }, (_, fila) => (
            <View key={fila} style={{ flexDirection: 'row', marginBottom: 4 }}>
              {celdas.slice(fila * 7, fila * 7 + 7).map((dia, col) => {
                if (!dia) return <View key={col} style={{ flex: 1 }} />;
                const fecha = new Date(year, month, dia);
                const isPasado = fecha < hoy;
                const isoFecha = toISODate(fecha);
                const isSeleccionado = fechaLimite === isoFecha;
                const isHoy = toISODate(fecha) === toISODate(hoy);
                return (
                  <TouchableOpacity
                    key={col}
                    disabled={isPasado}
                    onPress={() => { setFechaLimite(isoFecha); setMostrarCalendario(false); }}
                    style={{
                      flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center',
                      borderRadius: 10, margin: 1,
                      backgroundColor: isSeleccionado ? '#059669' : 'transparent',
                      borderWidth: isHoy && !isSeleccionado ? 1 : 0,
                      borderColor: '#10B981',
                    }}
                  >
                    <Text style={{
                      fontSize: 13, fontWeight: isSeleccionado ? '700' : '400',
                      color: isSeleccionado ? '#fff' : isPasado ? t.border : t.text,
                    }}>
                      {dia}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {/* Quitar fecha */}
          {fechaLimite && (
            <TouchableOpacity onPress={() => { setFechaLimite(null); setMostrarCalendario(false); }}
              style={{ marginTop: 12, alignItems: 'center', paddingVertical: 10 }}>
              <Text style={{ color: '#FF4D6D', fontSize: 13, fontWeight: '600' }}>Quitar fecha límite</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    );
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
        fechaLimiteEntrega: fechaLimite,
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
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
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
              placeholderTextColor={t.textMuted}
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
              placeholderTextColor={t.textMuted}
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
                placeholderTextColor={t.textMuted}
                keyboardType="decimal-pad"
                style={{
                  backgroundColor: t.surface,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: t.border,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  color: isDark ? '#059669' : t.text,
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
                placeholderTextColor={t.textMuted}
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

          {/* Fecha límite de entrega */}
          <View>
            <Text style={{ color: t.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 }}>
              FECHA LÍMITE DE ENTREGA
            </Text>
            <TouchableOpacity
              onPress={() => setMostrarCalendario(true)}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                backgroundColor: t.surface, borderRadius: 14,
                borderWidth: 1, borderColor: fechaLimite ? 'rgba(5,150,105,0.45)' : t.border,
                paddingHorizontal: 16, paddingVertical: 14,
              }}
            >
              <Ionicons name="calendar-outline" size={18} color={fechaLimite ? '#059669' : t.textMuted} />
              <Text style={{ flex: 1, color: fechaLimite ? t.text : t.textMuted, fontSize: 15 }}>
                {fechaLimite ? formatFechaLimite(fechaLimite) : 'Sin fecha límite (opcional)'}
              </Text>
              {fechaLimite
                ? <Ionicons name="close-circle" size={18} color={t.textMuted} onPress={() => setFechaLimite(null)} />
                : <Ionicons name="chevron-forward" size={16} color={t.textMuted} />
              }
            </TouchableOpacity>
          </View>

          {renderCalendario()}

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