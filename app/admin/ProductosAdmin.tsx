import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchTodosProductos, toggleProductoActivo, eliminarProducto } from '../../services/adminService';
import { useTheme } from '../../hooks/useTheme';
import type { ProductoAdmin } from '../../services/adminService';

function formatPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
}

export default function ProductosAdmin() {
  const insets = useSafeAreaInsets();
  const t = useTheme();
  const [productos, setProductos] = useState<ProductoAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const data = await fetchTodosProductos();
      setProductos(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los productos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const onEliminar = (producto: ProductoAdmin) => {
    Alert.alert(
      'Eliminar publicación',
      `¿Eliminar permanentemente "${producto.nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setEliminando(producto.id);
            try {
              await eliminarProducto(producto.id);
              setProductos((prev) => prev.filter((p) => p.id !== producto.id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el producto.');
            } finally {
              setEliminando(null);
            }
          },
        },
      ],
    );
  };

  const onToggle = (producto: ProductoAdmin) => {
    const accion = producto.activo ? 'ocultar' : 'activar';
    Alert.alert(
      producto.activo ? 'Ocultar producto' : 'Activar producto',
      `¿Deseas ${accion} "${producto.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: producto.activo ? 'Ocultar' : 'Activar',
          style: producto.activo ? 'destructive' : 'default',
          onPress: async () => {
            setToggling(producto.id);
            try {
              const nuevoEstado = !producto.activo;
              await toggleProductoActivo(producto.id, nuevoEstado);
              setProductos((prev) =>
                prev.map((p) => (p.id === producto.id ? { ...p, activo: nuevoEstado } : p)),
              );
            } catch {
              Alert.alert('Error', 'No se pudo actualizar el producto.');
            } finally {
              setToggling(null);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: ProductoAdmin }) => {
    const esToggling = toggling === item.id;
    const esEliminando = eliminando === item.id;
    const activo = item.activo !== false;

    return (
      <View
        style={{
          backgroundColor: t.surface,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: activo ? t.border : '#2A1A1A',
          marginBottom: 10,
          overflow: 'hidden',
          opacity: activo ? 1 : 0.6,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 }}>
          {/* Imagen o placeholder */}
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: t.surface2,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="cube-outline" size={22} color={t.border} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: t.text, fontSize: 14, fontWeight: '700' }} numberOfLines={1}>
              {item.nombre}
            </Text>
            <Text style={{ color: t.textMuted, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
              {item.vendedor_nombre}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }}>
              <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '700' }}>
                {formatPrecio(item.precio)}
              </Text>
              {item.categoria && (
                <View
                  style={{
                    backgroundColor: t.surface2,
                    borderRadius: 6,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                  }}
                >
                  <Text style={{ color: t.textMuted, fontSize: 10 }}>{item.categoria}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            <View
              style={{
                backgroundColor: activo ? 'rgba(80,200,80,0.1)' : 'rgba(255,77,77,0.1)',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: activo ? 'rgba(80,200,80,0.25)' : 'rgba(255,77,77,0.25)',
                paddingHorizontal: 7,
                paddingVertical: 3,
              }}
            >
              <Text style={{ color: activo ? '#50C850' : '#FF4D4D', fontSize: 10, fontWeight: '700' }}>
                {activo ? 'Activo' : 'Oculto'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => onToggle(item)}
              disabled={esToggling}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: activo ? 'rgba(255,77,77,0.1)' : 'rgba(80,200,80,0.1)',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: activo ? 'rgba(255,77,77,0.25)' : 'rgba(80,200,80,0.25)',
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              {esToggling ? (
                <ActivityIndicator size={10} color="#555" />
              ) : (
                <Ionicons
                  name={activo ? 'eye-off-outline' : 'eye-outline'}
                  size={12}
                  color={activo ? '#FF4D4D' : '#50C850'}
                />
              )}
              <Text
                style={{
                  color: activo ? '#FF4D4D' : '#50C850',
                  fontSize: 10,
                  fontWeight: '600',
                }}
              >
                {activo ? 'Ocultar' : 'Activar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onEliminar(item)}
              disabled={esEliminando || esToggling}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: 'rgba(255,77,77,0.08)',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: 'rgba(255,77,77,0.2)',
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              {esEliminando ? (
                <ActivityIndicator size={10} color="#FF4D4D" />
              ) : (
                <Ionicons name="trash-outline" size={12} color="#FF4D4D" />
              )}
              <Text style={{ color: '#FF4D4D', fontSize: 10, fontWeight: '600' }}>
                Eliminar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const activos = productos.filter((p) => p.activo !== false).length;
  const ocultos = productos.length - activos;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <LinearGradient
        colors={t.headerBg}
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}
      >
        <Text style={{ color: t.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
          Administración
        </Text>
        <Text style={{ color: t.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.3 }}>
          Productos
        </Text>
        {!cargando && (
          <Text style={{ color: t.textMuted, fontSize: 13, marginTop: 4 }}>
            {activos} activo{activos !== 1 ? 's' : ''}{ocultos > 0 ? ` · ${ocultos} oculto${ocultos !== 1 ? 's' : ''}` : ''}
          </Text>
        )}
      </LinearGradient>

      {cargando ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#10B981" size="large" />
        </View>
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <Ionicons name="cube-outline" size={48} color={t.border} />
              <Text style={{ color: t.border, fontSize: 14, marginTop: 12 }}>
                No hay productos publicados
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
