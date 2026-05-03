import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, RefreshControl,
  TouchableOpacity, Modal, TextInput, KeyboardAvoidingView,
  Platform, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore } from '../../store/themeStore';
import { fetchOrdenesComprador, type OrdenConItems } from '../../services/ordenesService';
import {
  crearCalificacion,
  fetchCalificacionesDadas,
} from '../../services/calificacionesService';
import StarRating from '../../components/StarRating';

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

type ModalData = {
  orden: OrdenConItems;
  item: OrdenConItems['items_orden'][number];
};

type Props = {
  calificadas: Set<string>;
  onCalificar: (data: ModalData) => void;
};

function OrdenCard({ orden, calificadas, onCalificar }: { orden: OrdenConItems } & Props) {
  const t = useTheme();
  const estado = orden.estado ?? 'pendiente';
  const s = ESTADO_STYLE[estado] ?? ESTADO_STYLE.pendiente;
  const esEntregado = estado === 'entregado';

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
        {orden.items_orden.map((item, idx) => {
          const key = `${orden.id}:${item.producto_id}:${idx}`;
          const calKey = `${orden.id}:${item.producto_id}`;
          const calificado = calificadas.has(calKey);

          return (
            <View
              key={key}
              style={{
                paddingVertical: 8,
                borderTopWidth: 1,
                borderTopColor: t.surface2,
                gap: 4,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="bag-outline" size={13} color={t.textMuted} />
                <Text style={{ flex: 1, color: t.textSecondary, fontSize: 13 }} numberOfLines={1}>
                  {item.productos?.nombre ?? 'Producto'}
                </Text>
                <Text style={{ color: t.textMuted, fontSize: 12 }}>×{item.cantidad}</Text>
                <Text style={{ color: t.textMuted, fontSize: 12, width: 72, textAlign: 'right' }}>
                  {formatPrecio(item.precio_unit * item.cantidad)}
                </Text>
              </View>

              {esEntregado && (
                calificado ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 21 }}>
                    <StarRating value={5} size={12} />
                    <Text style={{ color: t.textMuted, fontSize: 11 }}>Reseña enviada</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => onCalificar({ orden, item })}
                    activeOpacity={0.7}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 21 }}
                  >
                    <StarRating value={0} size={12} />
                    <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '600' }}>
                      Dejar reseña
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          );
        })}

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

function ModalResena({
  data,
  onClose,
  onEnviado,
}: {
  data: ModalData;
  onClose: () => void;
  onEnviado: (calKey: string) => void;
}) {
  const { usuario } = useAuthStore();
  const t = useTheme();
  const isDark = useThemeStore((s) => s.isDark);
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  const productoId = data.item.producto_id;
  const vendedorId = data.item.productos?.vendedor_id ?? '';
  const nombreProducto = data.item.productos?.nombre ?? 'Producto';

  const handleEnviar = async () => {
    if (puntuacion === 0) {
      Alert.alert('Elige una puntuación', 'Toca las estrellas para calificar.');
      return;
    }
    if (!usuario || !productoId || !vendedorId) return;
    setEnviando(true);
    try {
      await crearCalificacion({
        compradorId: usuario.id,
        vendedorId,
        productoId,
        ordenId: data.orden.id,
        puntuacion,
        comentario: comentario.trim() || undefined,
      });
      onEnviado(`${data.orden.id}:${productoId}`);
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo enviar la reseña.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <View style={{
          backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 40,
        }}>
          {/* Handle */}
          <View style={{
            width: 40, height: 4, borderRadius: 2,
            backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
            alignSelf: 'center', marginBottom: 20,
          }} />

          <Text style={{ color: t.text, fontSize: 18, fontWeight: '800', marginBottom: 4 }}>
            Calificar producto
          </Text>
          <Text style={{ color: t.textMuted, fontSize: 13, marginBottom: 24 }} numberOfLines={2}>
            {nombreProducto}
          </Text>

          {/* Estrellas */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <StarRating
              value={puntuacion}
              size={40}
              interactive
              onChange={setPuntuacion}
              gap={8}
            />
            <Text style={{ color: t.textMuted, fontSize: 12, marginTop: 8 }}>
              {puntuacion === 0 ? 'Toca para calificar' :
               puntuacion === 1 ? 'Muy malo' :
               puntuacion === 2 ? 'Malo' :
               puntuacion === 3 ? 'Regular' :
               puntuacion === 4 ? 'Bueno' : 'Excelente'}
            </Text>
          </View>

          {/* Comentario */}
          <TextInput
            value={comentario}
            onChangeText={setComentario}
            placeholder="Escribe un comentario (opcional)..."
            placeholderTextColor={t.textMuted}
            multiline
            maxLength={300}
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              borderRadius: 14,
              borderWidth: 1,
              borderColor: t.border,
              color: t.text,
              fontSize: 14,
              padding: 14,
              minHeight: 90,
              textAlignVertical: 'top',
              marginBottom: 20,
            }}
          />

          {/* Botones */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={{
                flex: 1,
                height: 50,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: t.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: t.textMuted, fontSize: 15, fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleEnviar}
              disabled={enviando}
              activeOpacity={0.8}
              style={{ flex: 2 }}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  height: 50,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                }}
              >
                {enviando
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Ionicons name="star" size={16} color="#fff" />
                }
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
                  {enviando ? 'Enviando...' : 'Enviar reseña'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function HistorialComprador() {
  const { usuario } = useAuthStore();
  const t = useTheme();
  const [ordenes, setOrdenes] = useState<OrdenConItems[]>([]);
  const [calificadas, setCalificadas] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      const [data, dadas] = await Promise.all([
        fetchOrdenesComprador(usuario!.id),
        fetchCalificacionesDadas(usuario!.id),
      ]);
      setOrdenes(data);
      setCalificadas(dadas);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar historial');
    } finally {
      setCargando(false);
      setRefreshing(false);
    }
  }, [usuario]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleEnviado = useCallback((calKey: string) => {
    setCalificadas((prev) => new Set([...prev, calKey]));
  }, []);

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
    <>
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
        renderItem={({ item }) => (
          <OrdenCard
            orden={item}
            calificadas={calificadas}
            onCalificar={setModalData}
          />
        )}
      />

      {modalData && (
        <ModalResena
          data={modalData}
          onClose={() => setModalData(null)}
          onEnviado={handleEnviado}
        />
      )}
    </>
  );
}
