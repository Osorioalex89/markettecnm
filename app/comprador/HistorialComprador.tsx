import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import { fetchOrdenesComprador, type OrdenConItems } from '../../services/ordenesService';

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

function OrdenCard({ orden }: { orden: OrdenConItems }) {
  const t = useTheme();
  const estado = orden.estado ?? 'pendiente';
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
        colors={['#10B981', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 2 }}
      />
      <View style={{ padding: 16 }}>
        {/* Cabecera */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View>
            <Text style={{ color: t.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>
              PEDIDO
            </Text>
            <Text style={{ color: t.textMuted, fontSize: 12, marginTop: 1 }}>
              {formatFecha(orden.creado_en)}
            </Text>
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
        {orden.items_orden.slice(0, 3).map((item, idx) => (
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
            <Ionicons name="bag-outline" size={13} color={t.textMuted} />
            <Text style={{ flex: 1, color: t.textSecondary, fontSize: 13 }} numberOfLines={1}>
              {item.productos?.nombre ?? 'Producto'}
            </Text>
            <Text style={{ color: t.textMuted, fontSize: 12 }}>×{item.cantidad}</Text>
            <Text style={{ color: t.textMuted, fontSize: 12, width: 72, textAlign: 'right' }}>
              {formatPrecio(item.precio_unit * item.cantidad)}
            </Text>
          </View>
        ))}
        {orden.items_orden.length > 3 && (
          <Text style={{ color: t.textMuted, fontSize: 12, marginTop: 6 }}>
            +{orden.items_orden.length - 3} producto{orden.items_orden.length - 3 > 1 ? 's' : ''} más
          </Text>
        )}

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
              {orden.punto_entrega ?? '—'}
            </Text>
          </View>
          <Text style={{ color: '#059669', fontSize: 16, fontWeight: '800' }}>
            {formatPrecio(orden.total)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function HistorialComprador() {
  const { usuario } = useAuthStore();
  const t = useTheme();
  const [ordenes, setOrdenes] = useState<OrdenConItems[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchOrdenesComprador(usuario!.id);
      setOrdenes(data);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar historial');
    } finally {
      setCargando(false);
      setRefreshing(false);
    }
  }, [usuario]);

  useEffect(() => { cargar(); }, [cargar]);

  if (cargando) {
    return <ActivityIndicator color="#10B981" style={{ marginTop: 40 }} />;
  }

  if (error) {
    return (
      <View style={{ alignItems: 'center', marginTop: 40, paddingHorizontal: 40 }}>
        <Text style={{ color: '#F87171', fontSize: 14, textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={ordenes}
      keyExtractor={(o) => o.id}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); cargar(); }}
          tintColor="#10B981"
        />
      }
      ListEmptyComponent={
        <View style={{ alignItems: 'center', marginTop: 40, paddingHorizontal: 40 }}>
          <Ionicons name="receipt-outline" size={48} color={t.textMuted} style={{ marginBottom: 16 }} />
          <Text style={{ color: t.textMuted, fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
            Sin pedidos todavía
          </Text>
          <Text style={{ color: t.textMuted, fontSize: 14, textAlign: 'center' }}>
            Cuando confirmes un pedido aparecerá aquí
          </Text>
        </View>
      }
      renderItem={({ item }) => <OrdenCard orden={item} />}
    />
  );
}