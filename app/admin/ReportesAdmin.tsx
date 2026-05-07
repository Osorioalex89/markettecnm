import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { fetchReportes, marcarRevisado, type Reporte, type TipoReporte } from '../../services/reportesService';

type Filtro = 'todos' | 'pendientes' | 'revisados';

const TIPO_CONFIG: Record<TipoReporte, { label: string; icon: string; color: string }> = {
  producto: { label: 'Producto',      icon: 'cube-outline',        color: '#10B981' },
  usuario:  { label: 'Usuario',       icon: 'person-outline',      color: '#F59E0B' },
  chat:     { label: 'Conversación',  icon: 'chatbubble-outline',  color: '#6366F1' },
};

function formatFecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ReportesAdmin() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [actualizando, setActualizando] = useState<string | null>(null);

  const cargar = useCallback(async (esRefresh = false) => {
    if (esRefresh) setRefrescando(true);
    try {
      const data = await fetchReportes();
      setReportes(data);
    } catch {
      // silencioso
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const toggleRevisado = async (reporte: Reporte) => {
    setActualizando(reporte.id);
    try {
      await marcarRevisado(reporte.id, !reporte.revisado);
      setReportes((prev) =>
        prev.map((r) => r.id === reporte.id ? { ...r, revisado: !r.revisado } : r)
      );
    } catch {
      // silencioso
    } finally {
      setActualizando(null);
    }
  };

  const reportesFiltrados = reportes.filter((r) => {
    if (filtro === 'pendientes') return !r.revisado;
    if (filtro === 'revisados') return r.revisado;
    return true;
  });

  const pendientes = reportes.filter((r) => !r.revisado).length;

  const renderItem = ({ item }: { item: Reporte }) => {
    const cfg = TIPO_CONFIG[item.tipo];
    const revisandose = actualizando === item.id;

    return (
      <View style={{
        backgroundColor: t.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: item.revisado ? t.border : 'rgba(255,77,109,0.2)',
        marginHorizontal: 16,
        marginBottom: 10,
        overflow: 'hidden',
        opacity: item.revisado ? 0.65 : 1,
      }}>
        {!item.revisado && (
          <LinearGradient
            colors={['#FF4D6D', 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ height: 2 }}
          />
        )}
        <View style={{ padding: 14 }}>
          {/* Fila superior: tipo + fecha + toggle */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 5,
              backgroundColor: `${cfg.color}18`, borderRadius: 20,
              paddingHorizontal: 10, paddingVertical: 4,
              borderWidth: 1, borderColor: `${cfg.color}30`,
            }}>
              <Ionicons name={cfg.icon as any} size={11} color={cfg.color} />
              <Text style={{ color: cfg.color, fontSize: 11, fontWeight: '600' }}>{cfg.label}</Text>
            </View>

            {item.revisado && (
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 20,
                paddingHorizontal: 8, paddingVertical: 4,
              }}>
                <Ionicons name="checkmark-circle" size={11} color="#10B981" />
                <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '600' }}>Revisado</Text>
              </View>
            )}

            <Text style={{ color: t.textMuted, fontSize: 11, marginLeft: 'auto' }}>
              {formatFecha(item.creado_en)}
            </Text>

            <TouchableOpacity
              onPress={() => toggleRevisado(item)}
              disabled={!!actualizando}
              style={{
                width: 32, height: 32, borderRadius: 10,
                backgroundColor: item.revisado ? t.surface2 : 'rgba(255,77,109,0.1)',
                borderWidth: 1,
                borderColor: item.revisado ? t.border : 'rgba(255,77,109,0.3)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              {revisandose ? (
                <ActivityIndicator size="small" color={item.revisado ? t.textMuted : '#FF4D6D'} />
              ) : (
                <Ionicons
                  name={item.revisado ? 'refresh-outline' : 'checkmark'}
                  size={15}
                  color={item.revisado ? t.textMuted : '#FF4D6D'}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Motivo */}
          <Text style={{ color: t.text, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
            {item.motivo}
          </Text>

          {/* Reporter */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="person-circle-outline" size={14} color={t.textMuted} />
            <Text style={{ color: t.textMuted, fontSize: 12 }}>
              {item.reporter?.nombre ?? 'Usuario desconocido'}
              {item.reporter?.matricula ? ` · ${item.reporter.matricula}` : ''}
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,77,109,0.12)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="flag" size={18} color="#FF4D6D" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: t.text, fontSize: 18, fontWeight: '800' }}>Reportes</Text>
            {pendientes > 0 && (
              <Text style={{ color: '#FF4D6D', fontSize: 12, marginTop: 1 }}>
                {pendientes} pendiente{pendientes > 1 ? 's' : ''} de revisión
              </Text>
            )}
          </View>
        </View>

        {/* Chips filtro */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
          {(['todos', 'pendientes', 'revisados'] as Filtro[]).map((f) => {
            const activo = filtro === f;
            const label = f === 'todos' ? 'Todos' : f === 'pendientes' ? 'Pendientes' : 'Revisados';
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setFiltro(f)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
                  backgroundColor: activo ? '#FF4D6D' : t.surface2,
                  borderWidth: 1, borderColor: activo ? '#FF4D6D' : t.border,
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

      {/* Fade header→contenido */}
      <LinearGradient
        colors={['rgba(14,14,14,0.06)', 'transparent']}
        style={{ height: 24 }}
        pointerEvents="none"
      />

      {cargando ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#FF4D6D" />
        </View>
      ) : (
        <FlatList
          data={reportesFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={() => cargar(true)} tintColor="#FF4D6D" />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 80, gap: 12 }}>
              <Ionicons name="flag-outline" size={48} color={t.textMuted} />
              <Text style={{ color: t.textMuted, fontSize: 14 }}>
                {filtro === 'pendientes' ? 'Sin reportes pendientes' : 'Sin reportes aún'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
