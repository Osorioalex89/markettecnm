import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ProductoConVendedor } from '../services/productosService';

const CATEGORIA_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Electrónica': 'hardware-chip-outline',
  'Útiles': 'pencil-outline',
  'Libros': 'book-outline',
  'Accesorios': 'bag-outline',
  'Ropa': 'shirt-outline',
  'Alimentos': 'fast-food-outline',
  'Servicios': 'construct-outline',
};

const CATEGORIA_COLORS: Record<string, [string, string]> = {
  'Electrónica': ['#FF8C55', '#FF6B2B'],
  'Útiles': ['#FFD060', '#FFB830'],
  'Libros': ['#60B8FF', '#3A8FD6'],
  'Accesorios': ['#B860FF', '#8C3AD6'],
  'Ropa': ['#FF60A8', '#D63A7A'],
  'Alimentos': ['#60FF9A', '#3AD66A'],
  'Servicios': ['#FF9A60', '#D66A3A'],
};

function formatPrecio(precio: number): string {
  return `$${precio.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

type Props = {
  producto: ProductoConVendedor;
  onPress?: () => void;
  onAgregarCarrito?: () => void;
  onContactar?: () => void;
  contactando?: boolean;
  style?: object;
};

export default function ProductCard({ producto, onPress, onAgregarCarrito, onContactar, contactando, style }: Props) {
  const icon = CATEGORIA_ICON[producto.categoria ?? ''] ?? 'pricetag-outline';
  const colors = CATEGORIA_COLORS[producto.categoria ?? ''] ?? ['#FF8C55', '#FF6B2B'];

  // --- Animación carrito ---
  const [agregado, setAgregado] = useState(false);
  const cartScale = useRef(new Animated.Value(1)).current;

  const handleAgregarCarrito = () => {
    if (!onAgregarCarrito || agregado) return;
    onAgregarCarrito();
    setAgregado(true);
    Animated.sequence([
      Animated.spring(cartScale, { toValue: 1.35, useNativeDriver: true, speed: 40, bounciness: 12 }),
      Animated.spring(cartScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
    setTimeout(() => setAgregado(false), 1600);
  };

  // --- Animación botón mensaje ---
  const msgScale = useRef(new Animated.Value(1)).current;
  const onMsgPressIn = () =>
    Animated.spring(msgScale, { toValue: 0.85, useNativeDriver: true, speed: 60, bounciness: 6 }).start();
  const onMsgPressOut = () =>
    Animated.spring(msgScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }).start();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      style={[{
        backgroundColor: '#141414',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#2E2E2E',
        overflow: 'hidden',
      }, style]}
    >
      {/* Franja accent superior (solo cuando no hay imagen) */}
      {!producto.imagen_url && (
        <LinearGradient
          colors={[colors[0], colors[1], 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 2 }}
        />
      )}

      {/* Badge "Último" absoluto */}
      {(producto.stock ?? 0) <= 1 && (
        <View style={{
          position: 'absolute', top: 10, right: 10, zIndex: 2,
          backgroundColor: 'rgba(255,77,109,0.88)',
          borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2,
        }}>
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>Último</Text>
        </View>
      )}

      {/* Imagen real o ícono de fallback */}
      {producto.imagen_url ? (
        <View style={{ width: '100%', height: 130, backgroundColor: '#1A1A1A' }}>
          <Image
            source={{ uri: producto.imagen_url }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(10,10,10,0.55)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40 }}
            pointerEvents="none"
          />
        </View>
      ) : (
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 54, height: 54, borderRadius: 16,
            alignSelf: 'center', marginTop: 20,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Ionicons name={icon} size={24} color="#fff" />
        </LinearGradient>
      )}

      {/* Nombre */}
      <Text
        style={{
          color: '#F5F5F5', fontSize: 13, fontWeight: '700',
          textAlign: 'center', marginTop: 10, paddingHorizontal: 10, lineHeight: 18,
        }}
        numberOfLines={2}
      >
        {producto.nombre}
      </Text>

      {/* Vendedor */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 4 }}>
        <Ionicons name="person-outline" size={10} color="#555" />
        <Text style={{ color: '#555', fontSize: 10 }} numberOfLines={1}>
          {producto.perfiles?.nombre ?? 'Vendedor'}
        </Text>
      </View>

      {/* Precio */}
      <Text style={{
        color: '#FFB830', fontSize: 17, fontWeight: '800',
        textAlign: 'center', marginTop: 8,
      }}>
        {formatPrecio(Number(producto.precio))}
      </Text>

      {/* Fila inferior: badge categoría + botones */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 6,
        marginTop: 10, marginBottom: 14, paddingHorizontal: 10,
      }}>
        {/* Categoría */}
        <View style={{
          backgroundColor: '#1E1E1E', borderRadius: 20,
          paddingHorizontal: 7, paddingVertical: 3,
          borderWidth: 1, borderColor: '#2A2A2A',
          maxWidth: 72,
        }}>
          <Text style={{ color: '#555', fontSize: 9, fontWeight: '600', textAlign: 'center' }} numberOfLines={1}>
            {producto.categoria ?? 'Otro'}
          </Text>
        </View>

        {/* Botón mensaje con spring */}
        {onContactar && (
          <Animated.View style={{ transform: [{ scale: msgScale }] }}>
            <TouchableOpacity
              onPress={onContactar}
              onPressIn={onMsgPressIn}
              onPressOut={onMsgPressOut}
              disabled={contactando}
              activeOpacity={1}
              style={{
                width: 30, height: 30, borderRadius: 10,
                backgroundColor: contactando ? 'rgba(255,184,48,0.08)' : 'rgba(255,184,48,0.15)',
                borderWidth: 1, borderColor: 'rgba(255,184,48,0.35)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              {contactando
                ? <ActivityIndicator size={12} color="#FFB830" />
                : <Ionicons name="chatbubble-ellipses-outline" size={15} color="#FFB830" />}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Botón carrito con animación */}
        {onAgregarCarrito && (
          <TouchableOpacity
            onPress={handleAgregarCarrito}
            activeOpacity={0.8}
            style={{
              width: 30, height: 30, borderRadius: 10,
              backgroundColor: agregado ? 'rgba(46,213,115,0.15)' : 'rgba(255,107,43,0.15)',
              borderWidth: 1,
              borderColor: agregado ? 'rgba(46,213,115,0.4)' : 'rgba(255,107,43,0.35)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Animated.View style={{ transform: [{ scale: cartScale }] }}>
              <Ionicons
                name={agregado ? 'checkmark' : 'add'}
                size={16}
                color={agregado ? '#2ED573' : '#FF6B2B'}
              />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}