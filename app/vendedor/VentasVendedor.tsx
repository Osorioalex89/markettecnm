import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore } from '../../store/themeStore';
import { fetchVentasVendedor, type VentaVendedor } from '../../services/ordenesService';

const ESTADO_STYLE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  pendiente:  { bg: 'rgba(5,150,105,0.1)',  text: '#059669', border: 'rgba(5,150,105,0.3)',  label: 'Pendiente' },
  confirmado: { bg: 'rgba(74,222,128,0.1)',  text: '#4ADE80', border: 'rgba(74,222,128,0.3)',  label: 'Confirmado' },
  entregado:  { bg: 'rgba(74,222,128,0.15)', text: '#4ADE80', border: 'rgba(74,222,128,0.4)',  label: 'Entregado' },
  cancelado:  { bg: 'rgba(248,113,113,0.1)', text: '#F87171', border: 'rgba(248,113,113,0.3)', label: 'Cancelado' },
};

function formatFecha(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatPrecio(v: number) {
  return `$${v.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// ── Stats helpers ─────────────────────────────────────────────────────────────

const DIAS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function computeStats(ventas: VentaVendedor[]) {
  const hoy = new Date();
  const semana = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - (6 - i));
    return { label: DIAS_ES[d.getDay()], date: d.toISOString().slice(0, 10), value: 0 };
  });

  const mesActual = hoy.toISOString().slice(0, 7);
  let esteMes = 0;
  const porEstado: Record<string, number> = { pendiente: 0, confirmado: 0, entregado: 0, cancelado: 0 };

  for (const v of ventas) {
    const fecha = v.creado_en?.slice(0, 10) ?? '';
    const dia = semana.find((d) => d.date === fecha);
    if (dia) dia.value += v.subtotal;
    if (v.creado_en?.startsWith(mesActual) && v.estado !== 'cancelado') esteMes += v.subtotal;
    const estado = v.estado ?? 'pendiente';
    if (estado in porEstado) porEstado[estado]++;
  }

  return { semana, esteMes, porEstado };
}

// ── Bar chart ─────────────────────────────────────────────────────────────────

type BarData = { label: string; value: number };

function BarChart({ data, t }: { data: BarData[]; t: ReturnType<typeof useTheme> }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const CHART_H = 72;
  const hoy = new Date().toISOString().slice(0, 10);
  const todayIdx = data.findIndex((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10) === hoy;
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: CHART_H + 22 }}>
      {data.map((item, i) => {
        const barH = item.value > 0 ? Math.max((item.value / max) * CHART_H, 6) : 3;
        const isToday = i === todayIdx;
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: CHART_H + 22 }}>
            <LinearGradient
              colors={item.value > 0 ? ['#34D399', '#059669'] : [t.surface2, t.surface2]}
              style={{
                width: '100%', height: barH, borderRadius: 5,
                opacity: isToday ? 1 : 0.7,
              }}
            />
            <Text style={{
              color: isToday ? '#10B981' : t.textMuted,
              fontSize: 9, marginTop: 5, fontWeight: isToday ? '700' : '400',
            }}>
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Stats section ─────────────────────────────────────────────────────────────

function StatsSection({ ventas, t, isDark }: { ventas: VentaVendedor[]; t: ReturnType<typeof useTheme>; isDark: boolean }) {
  const stats = useMemo(() => computeStats(ventas), [ventas]);
  const semanaTotal = stats.semana.reduce((acc, d) => acc + d.value, 0);

  const chips = [
    { label: 'Pendientes', value: stats.porEstado.pendiente, color: '#059669' },
    { label: 'Confirmados', value: stats.porEstado.confirmado, color: '#4ADE80' },
    { label: 'Entregados', value: stats.porEstado.entregado, color: '#34D399' },
    { label: 'Cancelados', value: stats.porEstado.cancelado, color: '#F87171' },
  ];

  return (
    <View style={{ marginBottom: 20 }}>
      {/* Section title */}
      <Text style={{
        color: t.textMuted, fontSize: 11, fontWeight: '600',
        letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12,
      }}>
        Estadísticas
      </Text>

      {/* Últimos 7 días */}
      <View style={{
        backgroundColor: t.surface, borderRadius: 18, borderWidth: 1,
        borderColor: t.border, padding: 16, marginBottom: 10,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: t.text, fontSize: 13, fontWeight: '700' }}>Últimos 7 días</Text>
          <Text style={{ color: '#059669', fontSize: 14, fontWeight: '800' }}>
            ${semanaTotal.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </Text>
        </View>
        <BarChart data={stats.semana} t={t} />
      </View>

      {/* Este mes */}
      <View style={{
        backgroundColor: isDark ? 'rgba(74,222,128,0.06)' : 'rgba(5,150,105,0.05)',
        borderRadius: 16, borderWidth: 1,
        borderColor: isDark ? 'rgba(74,222,128,0.15)' : 'rgba(5,150,105,0.15)',
        padding: 14, marginBottom: 10,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{
            width: 36, height: 36, borderRadius: 10,
            backgroundColor: 'rgba(74,222,128,0.12)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="calendar-outline" size={18} color="#4ADE80" />
          </View>
          <View>
            <Text style={{ color: t.textMuted, fontSize: 11, fontWeight: '600' }}>INGRESOS ESTE MES</Text>
            <Text style={{ color: '#4ADE80', fontSize: 20, fontWeight: '800', marginTop: 2 }}>
              ${stats.esteMes.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
        <Ionicons name="trending-up-outline" size={24} color="rgba(74,222,128,0.4)" />
      </View>

      {/* Estado chips */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {chips.map((c) => (
          <View key={c.label} style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            backgroundColor: t.surface, borderRadius: 20, borderWidth: 1,
            borderColor: t.border, paddingHorizontal: 12, paddingVertical: 7,
          }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.color }} />
            <Text style={{ color: t.textMuted, fontSize: 11 }}>{c.label} </Text>
            <Text style={{ color: c.color, fontSize: 12, fontWeight: '800' }}>{c.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Venta card ────────────────────────────────────────────────────────────────

function VentaCard({ venta }: { venta: VentaVendedor }) {
  const t = useTheme();
  const estado = venta.estado ?? 'pendiente';
  const s = ESTADO_STYLE[estado] ?? ESTADO_STYLE.pendiente;

  return (
    <View style={{
      backgroundColor: t.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: t.border,
      overflow: 'hidden',
      marginBottom: 12,
    }}>
      <LinearGradient
        colors={['#059669', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 2 }}
      />
      <View style={{ padding: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={{ width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="person" size={15} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={{ color: t.text, fontSize: 14, fontWeight: '700' }}>
                {venta.comprador_nombre}
              </Text>
              <Text style={{ color: t.textMuted, fontSize: 11, marginTop: 1 }}>
                {formatFecha(venta.creado_en)}
              </Text>
            </View>
          </View>
          <View style={{
            backgroundColor: s.bg,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: s.border,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}>
            <Text style={{ color: s.text, fontSize: 11, fontWeight: '700' }}>{s.label}</Text>
          </View>
        </View>

        {/* Items */}
        {venta.items.map((item, idx) => (
          <View
            key={idx}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 7,
              borderTopWidth: 1,
              borderTopColor: t.surface2,
              gap: 8,
            }}
          >
            <Ionicons name="cube-outline" size={13} color={t.border} />
            <Text style={{ flex: 1, color: t.textSecondary, fontSize: 13 }} numberOfLines={1}>
              {item.producto_nombre}
            </Text>
            <Text style={{ color: t.textMuted, fontSize: 12 }}>×{item.cantidad}</Text>
            <Text style={{ color: t.textMuted, fontSize: 12, width: 72, textAlign: 'right' }}>
              {formatPrecio(item.precio_unit * item.cantidad)}
            </Text>
          </View>
        ))}

        {/* Footer */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: t.border,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Ionicons name="location-outline" size={13} color={t.textMuted} />
            <Text style={{ color: t.textMuted, fontSize: 12 }} numberOfLines={1}>
              {venta.punto_entrega ?? '—'}
            </Text>
          </View>
          <Text style={{ color: '#059669', fontSize: 16, fontWeight: '800' }}>
            {formatPrecio(venta.subtotal)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function VentasVendedor() {
  const { usuario } = useAuthStore();
  const t = useTheme();
  const isDark = useThemeStore((s) => s.isDark);
  const [ventas, setVentas] = useState<VentaVendedor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchVentasVendedor(usuario!.id);
      setVentas(data);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar ventas');
    } finally {
      setCargando(false);
      setRefreshing(false);
    }
  }, [usuario]);

  useEffect(() => { cargar(); }, [cargar]);

  const totalGanado = ventas
    .filter((v) => v.estado !== 'cancelado')
    .reduce((acc, v) => acc + v.subtotal, 0);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <LinearGradient
        colors={t.headerBg}
        style={{ paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 }}
      >
        <Text style={{ color: t.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.3 }}>
          Mis ventas
        </Text>
        <Text style={{ color: t.textMuted, fontSize: 13, marginTop: 4 }}>
          Pedidos recibidos de tus productos
        </Text>
        {!cargando && ventas.length > 0 && (
          <View style={{
            marginTop: 14,
            flexDirection: 'row',
            gap: 12,
          }}>
            <View style={{
              flex: 1,
              backgroundColor: 'rgba(5,150,105,0.08)',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: 'rgba(5,150,105,0.2)',
              padding: 12,
            }}>
              <Text style={{ color: t.textMuted, fontSize: 11, fontWeight: '600' }}>PEDIDOS</Text>
              <Text style={{ color: '#059669', fontSize: 20, fontWeight: '800', marginTop: 2 }}>
                {ventas.length}
              </Text>
            </View>
            <View style={{
              flex: 2,
              backgroundColor: 'rgba(74,222,128,0.06)',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: 'rgba(74,222,128,0.15)',
              padding: 12,
            }}>
              <Text style={{ color: t.textMuted, fontSize: 11, fontWeight: '600' }}>TOTAL GANADO</Text>
              <Text style={{ color: '#4ADE80', fontSize: 20, fontWeight: '800', marginTop: 2 }}>
                {formatPrecio(totalGanado)}
              </Text>
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Fade header→contenido */}
      <LinearGradient
        colors={isDark ? ['rgba(14,14,14,0.6)', 'transparent'] : ['rgba(0,0,0,0.04)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ height: 48 }}
        pointerEvents="none"
      />

      {cargando ? (
        <ActivityIndicator color="#059669" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={{ alignItems: 'center', marginTop: 40, paddingHorizontal: 40 }}>
          <Text style={{ color: '#F87171', fontSize: 14, textAlign: 'center' }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={ventas}
          keyExtractor={(v) => v.orden_id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); cargar(); }}
              tintColor="#059669"
            />
          }
          ListHeaderComponent={
            ventas.length > 0 ? (
              <>
                <StatsSection ventas={ventas} t={t} isDark={isDark} />
                <Text style={{
                  color: t.textMuted, fontSize: 11, fontWeight: '600',
                  letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12,
                }}>
                  Pedidos recientes
                </Text>
              </>
            ) : null
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 40 }}>
              <Ionicons name="cube-outline" size={48} color={t.border} style={{ marginBottom: 16 }} />
              <Text style={{ color: t.textMuted, fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
                Sin ventas todavía
              </Text>
              <Text style={{ color: t.border, fontSize: 14, textAlign: 'center' }}>
                Cuando alguien compre uno de tus productos, aparecerá aquí
              </Text>
            </View>
          }
          renderItem={({ item }) => <VentaCard venta={item} />}
        />
      )}
    </View>
  );
}