import { useState } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Modal,
  Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useCarritoStore, type CartItem } from '../../store/carritoStore';
import { useAuthStore } from '../../store/authStore';
import { crearOrden } from '../../services/ordenesService';
import HistorialComprador from './HistorialComprador';

const PUNTOS_ENTREGA = [
  'Edificio de Sistemas',
  'Cafetería central',
  'Biblioteca',
  'Cancha principal',
  'Entrada principal',
];

function formatPrecio(v: number) {
  return `$${v.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function ItemRow({ item, onIncrementar, onDecrementar, onEliminar }: {
  item: CartItem;
  onIncrementar: () => void;
  onDecrementar: () => void;
  onEliminar: () => void;
}) {
  return (
    <View style={{
      backgroundColor: '#141414',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#2E2E2E',
      padding: 14,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    }}>
      <View style={{
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center',
      }}>
        <Ionicons name="bag-outline" size={20} color="#FF6B2B" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: '#F5F5F5', fontSize: 14, fontWeight: '700' }} numberOfLines={1}>
          {item.producto.nombre}
        </Text>
        <Text style={{ color: '#FFB830', fontSize: 14, fontWeight: '800', marginTop: 2 }}>
          {formatPrecio(item.producto.precio * item.cantidad)}
        </Text>
      </View>

      {/* Controles de cantidad */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <TouchableOpacity
          onPress={onDecrementar}
          style={{ padding: 7, backgroundColor: '#1E1E1E', borderRadius: 9 }}
        >
          <Ionicons name="remove" size={15} color="#888" />
        </TouchableOpacity>
        <Text style={{ color: '#F5F5F5', fontSize: 14, fontWeight: '700', minWidth: 24, textAlign: 'center' }}>
          {item.cantidad}
        </Text>
        <TouchableOpacity
          onPress={onIncrementar}
          style={{ padding: 7, backgroundColor: '#1E1E1E', borderRadius: 9 }}
        >
          <Ionicons name="add" size={15} color="#FF6B2B" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onEliminar} style={{ padding: 6 }}>
        <Ionicons name="trash-outline" size={16} color="#3A3A3A" />
      </TouchableOpacity>
    </View>
  );
}

function VistaCarrito() {
  const { items, agregarItem, decrementarItem, quitarItem, limpiarCarrito, total } = useCarritoStore();
  const { usuario } = useAuthStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const totalCarrito = total();

  async function handleConfirmar() {
    if (!puntoSeleccionado) return Alert.alert('', 'Selecciona dónde recoger tu pedido');
    setConfirmando(true);
    try {
      await crearOrden({
        compradorId: usuario!.id,
        items: items.map((i) => ({
          productoId: i.producto.id,
          cantidad: i.cantidad,
          precioUnit: i.producto.precio,
        })),
        puntoEntrega: puntoSeleccionado,
        total: totalCarrito,
      });
      limpiarCarrito();
      setModalVisible(false);
      setPuntoSeleccionado('');
      Alert.alert('¡Pedido confirmado!', `Lo recoges en: ${puntoSeleccionado}`);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo confirmar el pedido');
    } finally {
      setConfirmando(false);
    }
  }

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
        <LinearGradient
          colors={['#FF8C55', '#FF6B2B']}
          style={{ width: 68, height: 68, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}
        >
          <Ionicons name="cart-outline" size={30} color="#fff" />
        </LinearGradient>
        <Text style={{ color: '#F5F5F5', fontSize: 18, fontWeight: '800', marginBottom: 8, textAlign: 'center' }}>
          Tu carrito está vacío
        </Text>
        <Text style={{ color: '#444', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
          Explora los productos del campus y agrega algo que te guste
        </Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={items}
        keyExtractor={(i) => i.producto.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ItemRow
            item={item}
            onIncrementar={() => agregarItem(item.producto)}
            onDecrementar={() => decrementarItem(item.producto.id)}
            onEliminar={() => quitarItem(item.producto.id)}
          />
        )}
      />

      {/* Footer */}
      <View style={{
        paddingHorizontal: 20, paddingBottom: 20, paddingTop: 12,
        borderTopWidth: 1, borderTopColor: '#1A1A1A',
        backgroundColor: '#0A0A0A',
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: '#666', fontSize: 14 }}>
              {items.length} {items.length === 1 ? 'producto' : 'productos'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={{ color: '#555', fontSize: 13 }}>Total</Text>
            <Text style={{ color: '#FFB830', fontSize: 24, fontWeight: '800' }}>
              {formatPrecio(totalCarrito)}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={() => Alert.alert('Vaciar carrito', '¿Eliminar todos los productos?', [
              { text: 'Cancelar' },
              { text: 'Vaciar', style: 'destructive', onPress: limpiarCarrito },
            ])}
            style={{
              paddingHorizontal: 16, paddingVertical: 15,
              borderRadius: 14, borderWidth: 1, borderColor: '#2A2A2A',
              backgroundColor: '#141414',
            }}
          >
            <Ionicons name="trash-outline" size={18} color="#555" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.85} style={{ flex: 1 }}>
            <LinearGradient
              colors={['#FF6B2B', '#FFB830']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 14, paddingVertical: 15,
                alignItems: 'center', flexDirection: 'row',
                justifyContent: 'center', gap: 8,
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#0A0A0A" />
              <Text style={{ color: '#0A0A0A', fontSize: 15, fontWeight: '800' }}>Confirmar pedido</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal punto de entrega */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)' }}
          activeOpacity={1}
          onPress={() => !confirmando && setModalVisible(false)}
        />
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: '#141414',
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          padding: 24, paddingBottom: 40,
        }}>
          <View style={{ width: 36, height: 4, backgroundColor: '#2A2A2A', borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
          <Text style={{ color: '#F5F5F5', fontSize: 20, fontWeight: '800', marginBottom: 4 }}>
            ¿Dónde recoges?
          </Text>
          <Text style={{ color: '#555', fontSize: 13, marginBottom: 18 }}>
            Selecciona el punto de entrega en el campus
          </Text>

          {PUNTOS_ENTREGA.map((punto) => (
            <TouchableOpacity
              key={punto}
              onPress={() => setPuntoSeleccionado(punto)}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row', alignItems: 'center',
                paddingVertical: 14, paddingHorizontal: 16,
                borderRadius: 14, borderWidth: 1, marginBottom: 8,
                backgroundColor: puntoSeleccionado === punto ? 'rgba(255,107,43,0.1)' : '#1A1A1A',
                borderColor: puntoSeleccionado === punto ? 'rgba(255,107,43,0.4)' : '#2A2A2A',
              }}
            >
              <Ionicons
                name={puntoSeleccionado === punto ? 'radio-button-on' : 'radio-button-off'}
                size={18}
                color={puntoSeleccionado === punto ? '#FF6B2B' : '#3A3A3A'}
                style={{ marginRight: 10 }}
              />
              <Ionicons name="location-outline" size={15} color="#555" style={{ marginRight: 8 }} />
              <Text style={{
                color: puntoSeleccionado === punto ? '#FF6B2B' : '#777',
                fontSize: 14,
                fontWeight: puntoSeleccionado === punto ? '700' : '400',
              }}>
                {punto}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={handleConfirmar}
            disabled={confirmando || !puntoSeleccionado}
            activeOpacity={0.85}
            style={{ marginTop: 8 }}
          >
            <LinearGradient
              colors={puntoSeleccionado ? ['#FF6B2B', '#FFB830'] : ['#1E1E1E', '#1E1E1E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 16, paddingVertical: 16,
                alignItems: 'center', justifyContent: 'center',
                flexDirection: 'row', gap: 8,
              }}
            >
              {confirmando ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="bag-check-outline" size={18} color={puntoSeleccionado ? '#0A0A0A' : '#3A3A3A'} />
                  <Text style={{ color: puntoSeleccionado ? '#0A0A0A' : '#3A3A3A', fontSize: 16, fontWeight: '800' }}>
                    Confirmar pedido
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

export default function CarritoComprador() {
  const [vistaActiva, setVistaActiva] = useState<'carrito' | 'pedidos'>('carrito');
  const { items } = useCarritoStore();

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      {/* Header */}
      <LinearGradient
        colors={['#1C0A00', '#0A0A0A']}
        style={{ paddingTop: 56, paddingBottom: 16, paddingHorizontal: 20 }}
      >
        <Text style={{ color: '#F5F5F5', fontSize: 26, fontWeight: '800', letterSpacing: -0.3, marginBottom: 14 }}>
          {vistaActiva === 'carrito' ? 'Mi carrito' : 'Mis pedidos'}
        </Text>

        {/* Segment control */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: '#141414',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#2A2A2A',
          padding: 3,
        }}>
          {(['carrito', 'pedidos'] as const).map((vista) => {
            const activo = vistaActiva === vista;
            const label = vista === 'carrito'
              ? `Carrito${items.length > 0 ? ` (${items.length})` : ''}`
              : 'Mis pedidos';
            return (
              <TouchableOpacity
                key={vista}
                onPress={() => setVistaActiva(vista)}
                activeOpacity={0.8}
                style={{ flex: 1 }}
              >
                {activo ? (
                  <LinearGradient
                    colors={['#FF6B2B', '#FFB830']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 9, paddingVertical: 8, alignItems: 'center' }}
                  >
                    <Text style={{ color: '#0A0A0A', fontSize: 13, fontWeight: '800' }}>{label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={{ borderRadius: 9, paddingVertical: 8, alignItems: 'center' }}>
                    <Text style={{ color: '#444', fontSize: 13, fontWeight: '500' }}>{label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>

      {/* Fade header→contenido */}
      <LinearGradient
        colors={['rgba(28,10,0,0.7)', 'transparent']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ height: 48 }}
        pointerEvents="none"
      />

      {vistaActiva === 'carrito' ? <VistaCarrito /> : <HistorialComprador />}
    </View>
  );
}