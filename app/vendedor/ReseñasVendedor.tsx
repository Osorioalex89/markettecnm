import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import { fetchMisCalificaciones, type CalificacionRecibida } from '../../services/calificacionesService';
import StarRating from '../../components/StarRating';

type Filtro = 'Todas' | 'positivas' | 'medias' | 'bajas';

const FILTROS: { key: Filtro; label: string; color: string; bg: string; border: string }[] = [
  { key: 'Todas',    label: 'Todas',   color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  { key: 'positivas',label: '★ 4-5',  color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  { key: 'medias',   label: '★ 3',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  { key: 'bajas',    label: '★ 1-2',  color: '#FF4D6D', bg: 'rgba(255,77,109,0.12)', border: 'rgba(255,77,109,0.3)' },
];

function puntuacionColor(p: number): string {
  if (p >= 4) return '#10B981';
  if (p === 3) return '#F59E0B';
  return '#FF4D6D';
}

function formatFecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ReseñasVendedor() {
  const insets = useSafeAreaInsets();
  const t = useTheme();
  const { usuario } = useAuthStore();
  const [items, setItems] = useState<CalificacionRecibida[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>('Todas');

  const cargar = useCallback(async (esRefresh = false) => {
    if (!usuario) return;
    if (esRefresh) setRefrescando(true); else setCargando(true);
    try {
      const data = await fetchMisCalificaciones(usuario.id);
      setItems(data);
    } catch { /* silencioso */ }
    finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [usuario]);

  useEffect(() => { cargar(); }, [cargar]);

  const filtrados = useMemo(() => {
    if (filtro === 'Todas') return items;
    if (filtro === 'positivas') return items.filter((r) => r.puntuacion >= 4);
    if (filtro === 'medias')    return items.filter((r) => r.puntuacion === 3);
    return items.filter((r) => r.puntuacion <= 2);
  }, [items, filtro]);

  const promedio = useMemo(() => {
    if (!items.length) return 0;
    return items.reduce((acc, r) => acc + r.puntuacion, 0) / items.length;
  }, [items]);

  const renderItem = ({ item }: { item: CalificacionRecibida }) => (
    <View style={{
      backgroundColor: t.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: t.border,
      marginBottom: 10,
      overflow: 'hidden',
    }}>
      <LinearGradient
        colors={['rgba(16,185,129,0.04)', 'transparent']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        pointerEvents="none"
      />
      <View style={{ padding: 14, gap: 8 }}>
        {/* Cabecera: estrellas + puntuación + fecha */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <StarRating value={item.puntuacion} size={16} />
            <View style={{
              backgroundColor: `${puntuacionColor(item.puntuacion)}20`,
              borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
              borderWidth: 1, borderColor: `${puntuacionColor(item.puntuacion)}40`,
            }}>
              <Text style={{ color: puntuacionColor(item.puntuacion), fontSize: 13, fontWeight: '800' }}>
                {item.puntuacion}/5
              </Text>
            </View>
          </View>
          <Text style={{ color: t.textMuted, fontSize: 12 }}>{formatFecha(item.creado_en)}</Text>
        </View>

        {/* Producto */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Ionicons name="cube-outline" size={13} color={t.textMuted} />
          <Text style={{ color: t.textMuted, fontSize: 13 }} numberOfLines={1}>
            {item.producto?.nombre ?? 'Producto'}
          </Text>
        </View>

        {/* Comprador */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Ionicons name="person-outline" size={13} color="#10B981" />
          <Text style={{ color: '#10B981', fontSize: 13 }}>
            {item.comprador?.nombre ?? 'Comprador'}
          </Text>
        </View>

        {/* Comentario */}
        {item.comentario ? (
          <View style={{
            borderLeftWidth: 3, borderLeftColor: '#10B981',
            paddingLeft: 10, marginTop: 2,
          }}>
            <Text style={{ color: t.textSecondary, fontSize: 14, lineHeight: 20, fontStyle: 'italic' }}>
              "{item.comentario}"
            </Text>
          </View>
        ) : (
          <Text style={{ color: t.textMuted, fontSize: 13, fontStyle: 'italic' }}>Sin comentario</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <LinearGradient
        colors={t.headerBg}
        style={{ paddingTop: insets.top + 16, paddingBottom: 20, paddingHorizontal: 20 }}
      >
        <Text style={{ color: t.textMuted, fontSize: 12, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
          Tu tienda
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: t.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.3 }}>
            Mis Reseñas
          </Text>
          {items.length > 0 && (
            <View style={{ alignItems: 'flex-end' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <StarRating value={promedio} size={15} />
                <Text style={{ color: t.text, fontSize: 18, fontWeight: '800' }}>
                  {promedio.toFixed(1)}
                </Text>
              </View>
              <Text style={{ color: t.textMuted, fontSize: 12 }}>{items.length} reseña{items.length !== 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {cargando ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#10B981" size="large" />
        </View>
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => cargar(true)} tintColor="#10B981" />}
          ListHeaderComponent={
            <View style={{ flexDirection: 'row', gap: 7, marginBottom: 14, flexWrap: 'wrap' }}>
              {FILTROS.map((f) => {
                const activo = filtro === f.key;
                return (
                  <TouchableOpacity
                    key={f.key}
                    onPress={() => setFiltro(f.key)}
                    activeOpacity={0.7}
                    style={{
                      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
                      borderWidth: 1,
                      backgroundColor: activo ? f.bg : 'transparent',
                      borderColor: activo ? f.border : t.border,
                    }}
                  >
                    <Text style={{ color: activo ? f.color : t.textMuted, fontSize: 13, fontWeight: '600' }}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          }
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 110 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Ionicons name="star-outline" size={48} color={t.border} />
              <Text style={{ color: t.textMuted, fontSize: 15, marginTop: 12, textAlign: 'center' }}>
                {items.length === 0 ? 'Aún no tienes reseñas' : 'Sin reseñas en este filtro'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
