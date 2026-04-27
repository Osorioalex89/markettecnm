import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { fetchVentasVendedor, type VentaVendedor } from '../../services/ordenesService';

const ESTADO_STYLE: Record<string, { bg: string; text: string; border: string; label: string }> = {
  pendiente:  { bg: 'rgba(255,184,48,0.1)',  text: '#FFB830', border: 'rgba(255,184,48,0.3)',  label: 'Pendiente' },
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

function VentaCard({ venta }: { venta: VentaVendedor }) {
  const estado = venta.estado ?? 'pendiente';
  const s = ESTADO_STYLE[estado] ?? ESTADO_STYLE.pendiente;

  return (
    <View style={{
      backgroundColor: '#141414',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#2E2E2E',
      overflow: 'hidden',
      marginBottom: 12,
    }}>
      <LinearGradient
        colors={['#FFB830', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 2 }}
      />
      <View style={{ padding: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <LinearGradient
              colors={['#FFB830', '#FF6B2B']}
              style={{ width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="person" size={15} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={{ color: '#F5F5F5', fontSize: 14, fontWeight: '700' }}>
                {venta.comprador_nombre}
              </Text>
              <Text style={{ color: '#555', fontSize: 11, marginTop: 1 }}>
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
              borderTopColor: '#1E1E1E',
              gap: 8,
            }}
          >
            <Ionicons name="cube-outline" size={13} color="#444" />
            <Text style={{ flex: 1, color: '#999', fontSize: 13 }} numberOfLines={1}>
              {item.producto_nombre}
            </Text>
            <Text style={{ color: '#555', fontSize: 12 }}>×{item.cantidad}</Text>
            <Text style={{ color: '#666', fontSize: 12, width: 72, textAlign: 'right' }}>
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
          borderTopColor: '#222',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Ionicons name="location-outline" size={13} color="#555" />
            <Text style={{ color: '#666', fontSize: 12 }} numberOfLines={1}>
              {venta.punto_entrega ?? '—'}
            </Text>
          </View>
          <Text style={{ color: '#FFB830', fontSize: 16, fontWeight: '800' }}>
            {formatPrecio(venta.subtotal)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function VentasVendedor() {
  const { usuario } = useAuthStore();
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
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <LinearGradient
        colors={['#1C0A00', '#0A0A0A']}
        style={{ paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20 }}
      >
        <Text style={{ color: '#F5F5F5', fontSize: 26, fontWeight: '800', letterSpacing: -0.3 }}>
          Mis ventas
        </Text>
        <Text style={{ color: '#666', fontSize: 13, marginTop: 4 }}>
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
              backgroundColor: 'rgba(255,184,48,0.08)',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: 'rgba(255,184,48,0.2)',
              padding: 12,
            }}>
              <Text style={{ color: '#555', fontSize: 11, fontWeight: '600' }}>PEDIDOS</Text>
              <Text style={{ color: '#FFB830', fontSize: 20, fontWeight: '800', marginTop: 2 }}>
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
              <Text style={{ color: '#555', fontSize: 11, fontWeight: '600' }}>TOTAL GANADO</Text>
              <Text style={{ color: '#4ADE80', fontSize: 20, fontWeight: '800', marginTop: 2 }}>
                {formatPrecio(totalGanado)}
              </Text>
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Fade header→contenido */}
      <LinearGradient
        colors={['rgba(28,10,0,0.7)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ height: 48 }}
        pointerEvents="none"
      />

      {cargando ? (
        <ActivityIndicator color="#FFB830" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={{ alignItems: 'center', marginTop: 40, paddingHorizontal: 40 }}>
          <Text style={{ color: '#F87171', fontSize: 14, textAlign: 'center' }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={ventas}
          keyExtractor={(v) => v.orden_id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); cargar(); }}
              tintColor="#FFB830"
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 40 }}>
              <Ionicons name="cube-outline" size={48} color="#2E2E2E" style={{ marginBottom: 16 }} />
              <Text style={{ color: '#555', fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
                Sin ventas todavía
              </Text>
              <Text style={{ color: '#3A3A3A', fontSize: 14, textAlign: 'center' }}>
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