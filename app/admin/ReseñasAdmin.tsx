import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore } from '../../store/themeStore';
import {
  fetchTodasCalificaciones,
  eliminarCalificacionAdmin,
  type CalificacionAdmin,
} from '../../services/calificacionesService';
import StarRating from '../../components/StarRating';

type FiltroPuntuacion = 'todas' | 'baja' | 'media' | 'alta';

const CHIPS: { key: FiltroPuntuacion; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'baja',  label: '★ 1-2' },
  { key: 'media', label: '★ 3' },
  { key: 'alta',  label: '★ 4-5' },
];

function formatFecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ReseñasAdmin() {
  const t = useTheme();
  const isDark = useThemeStore((s) => s.isDark);
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<CalificacionAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [filtro, setFiltro] = useState<FiltroPuntuacion>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [eliminando, setEliminando] = useState<string | null>(null);

  const cargar = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    try {
      const data = await fetchTodasCalificaciones();
      setItems(data);
    } catch {
      // silencioso
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const confirmarEliminar = (item: CalificacionAdmin) => {
    Alert.alert(
      'Eliminar reseña',
      `¿Eliminar la reseña de ${item.comprador?.nombre ?? 'este usuario'} sobre "${item.producto?.nombre ?? 'este producto'}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setEliminando(item.id);
            try {
              await eliminarCalificacionAdmin(item.id);
              setItems((prev) => prev.filter((r) => r.id !== item.id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la reseña.');
            } finally {
              setEliminando(null);
            }
          },
        },
      ]
    );
  };

  const filtradas = items.filter((item) => {
    const pasaFiltro =
      filtro === 'todas' ? true :
      filtro === 'baja'  ? item.puntuacion <= 2 :
      filtro === 'media' ? item.puntuacion === 3 :
      item.puntuacion >= 4;

    const term = busqueda.trim().toLowerCase();
    const pasaBusqueda = !term ||
      (item.vendedor?.nombre ?? '').toLowerCase().includes(term) ||
      (item.comprador?.nombre ?? '').toLowerCase().includes(term) ||
      (item.producto?.nombre ?? '').toLowerCase().includes(term);

    return pasaFiltro && pasaBusqueda;
  });

  const renderItem = ({ item }: { item: CalificacionAdmin }) => {
    const esEliminando = eliminando === item.id;
    const colorPuntuacion = item.puntuacion <= 2 ? '#FF4D6D' : item.puntuacion === 3 ? '#F59E0B' : '#10B981';

    return (
      <View style={{
        backgroundColor: t.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: t.border,
        marginHorizontal: 16,
        marginBottom: 10,
        overflow: 'hidden',
      }}>
        <LinearGradient
          colors={[`${colorPuntuacion}30`, 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ height: 2 }}
        />
        <View style={{ padding: 14 }}>
          {/* Fila superior: estrellas + fecha + eliminar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <StarRating value={item.puntuacion} size={14} />
            <Text style={{ color: colorPuntuacion, fontSize: 12, fontWeight: '700' }}>
              {item.puntuacion}.0
            </Text>

            <Text style={{ color: t.textMuted, fontSize: 11, marginLeft: 'auto' }}>
              {formatFecha(item.creado_en)}
            </Text>

            <TouchableOpacity
              onPress={() => confirmarEliminar(item)}
              disabled={!!eliminando}
              style={{
                width: 32, height: 32, borderRadius: 10,
                backgroundColor: 'rgba(255,77,109,0.1)',
                borderWidth: 1, borderColor: 'rgba(255,77,109,0.25)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              {esEliminando
                ? <ActivityIndicator size="small" color="#FF4D6D" />
                : <Ionicons name="trash-outline" size={15} color="#FF4D6D" />
              }
            </TouchableOpacity>
          </View>

          {/* Producto */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Ionicons name="cube-outline" size={13} color="#10B981" />
            <Text style={{ color: t.text, fontSize: 13, fontWeight: '700', flex: 1 }} numberOfLines={1}>
              {item.producto?.nombre ?? '—'}
            </Text>
          </View>

          {/* Comentario */}
          {!!item.comentario && (
            <Text style={{
              color: t.textSecondary, fontSize: 13,
              fontStyle: 'italic', marginBottom: 10,
              paddingLeft: 4, borderLeftWidth: 2, borderLeftColor: t.border,
            }}>
              "{item.comentario}"
            </Text>
          )}

          {/* Comprador → Vendedor */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="person-outline" size={13} color={t.textMuted} />
            <Text style={{ color: t.textMuted, fontSize: 12 }}>
              {item.comprador?.nombre ?? '—'}
            </Text>
            <Ionicons name="arrow-forward-outline" size={11} color={t.textMuted} />
            <Ionicons name="storefront-outline" size={13} color={t.textMuted} />
            <Text style={{ color: t.textMuted, fontSize: 12 }}>
              {item.vendedor?.nombre ?? '—'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Header */}
      <LinearGradient
        colors={t.headerBg}
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: 14,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: t.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <View style={{
            width: 36, height: 36, borderRadius: 12,
            backgroundColor: 'rgba(245,158,11,0.12)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="star" size={18} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: t.text, fontSize: 18, fontWeight: '800' }}>Reseñas</Text>
            <Text style={{ color: t.textMuted, fontSize: 12, marginTop: 1 }}>
              {items.length} reseña{items.length !== 1 ? 's' : ''} en total
            </Text>
          </View>
        </View>

        {/* Buscador */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 8,
          backgroundColor: t.surface2, borderRadius: 12,
          borderWidth: 1, borderColor: t.border,
          paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12,
        }}>
          <Ionicons name="search-outline" size={15} color={t.textMuted} />
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar por vendedor, comprador o producto..."
            placeholderTextColor={t.textMuted}
            style={{ flex: 1, color: t.text, fontSize: 13 }}
          />
          {!!busqueda && (
            <TouchableOpacity onPress={() => setBusqueda('')}>
              <Ionicons name="close-circle" size={16} color={t.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Chips filtro puntuación */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {CHIPS.map(({ key, label }) => {
            const activo = filtro === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setFiltro(key)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
                  backgroundColor: activo ? '#F59E0B' : t.surface2,
                  borderWidth: 1, borderColor: activo ? '#F59E0B' : t.border,
                }}
              >
                <Text style={{ color: activo ? '#fff' : t.textMuted, fontSize: 12, fontWeight: '600' }}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>

      {/* Fade */}
      <LinearGradient
        colors={isDark ? ['rgba(14,14,14,0.06)', 'transparent'] : ['rgba(0,0,0,0.04)', 'transparent']}
        style={{ height: 24 }}
        pointerEvents="none"
      />

      {cargando ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#F59E0B" />
        </View>
      ) : (
        <FlatList
          data={filtradas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={() => cargar(true)} tintColor="#F59E0B" />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 80, gap: 12 }}>
              <Ionicons name="star-outline" size={48} color={t.textMuted} />
              <Text style={{ color: t.textMuted, fontSize: 14 }}>
                {busqueda || filtro !== 'todas' ? 'Sin resultados' : 'No hay reseñas aún'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
