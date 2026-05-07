import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ProductoConVendedor } from '../services/productosService';
import { useTheme } from '../hooks/useTheme';
import StarRating from './StarRating';

const CATEGORIA_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Electrónica': 'hardware-chip-outline',
  'Útiles':      'pencil-outline',
  'Libros':      'book-outline',
  'Accesorios':  'bag-outline',
  'Ropa':        'shirt-outline',
  'Alimentos':   'fast-food-outline',
  'Servicios':   'construct-outline',
};

const CATEGORIA_COLORS: Record<string, [string, string]> = {
  'Electrónica': ['#34D399', '#10B981'],
  'Útiles':      ['#6EE7B7', '#34D399'],
  'Libros':      ['#10B981', '#047857'],
  'Accesorios':  ['#34D399', '#059669'],
  'Ropa':        ['#A7F3D0', '#10B981'],
  'Alimentos':   ['#6EE7B7', '#10B981'],
  'Servicios':   ['#059669', '#047857'],
};

function formatPrecio(precio: number): string {
  return `$${precio.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const MESES_CORTOS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function useFechaLimiteBadge(iso: string | null | undefined): { label: string; color: string; bg: string } | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const limite = new Date(y, m - 1, d);
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const diasRestantes = Math.round((limite.getTime() - hoy.getTime()) / 86400000);
  if (diasRestantes < 0) return null;
  const label = diasRestantes === 0 ? 'Hoy' : diasRestantes === 1 ? 'Mañana' : `${d} ${MESES_CORTOS[m - 1]}`;
  const urgente = diasRestantes <= 1;
  const proximo = diasRestantes <= 7;
  return {
    label,
    color: urgente ? '#FF4D6D' : proximo ? '#F59E0B' : '#6B7280',
    bg:    urgente ? 'rgba(255,77,109,0.12)' : proximo ? 'rgba(245,158,11,0.12)' : 'rgba(107,114,128,0.1)',
  };
}

type Props = {
  producto: ProductoConVendedor;
  onPress?: () => void;
  onAgregarCarrito?: () => void;
  onContactar?: () => void;
  contactando?: boolean;
  style?: object;
  onFavorito?: () => void;
  esFavorito?: boolean;
  onVerVendedor?: () => void;
  rating?: { promedio: number; total: number };
};

export default function ProductCard({
  producto, onPress, onAgregarCarrito, onContactar,
  contactando, style, onFavorito, esFavorito, onVerVendedor, rating,
}: Props) {
  const t = useTheme();
  const icon   = CATEGORIA_ICON[producto.categoria ?? ''] ?? 'pricetag-outline';
  const colors = CATEGORIA_COLORS[producto.categoria ?? ''] ?? ['#34D399', '#10B981'];
  const sinStock = (producto.stock ?? 0) <= 0;
  const fechaBadge = useFechaLimiteBadge((producto as any).fecha_limite_entrega);

  // --- Animación carrito ---
  const [agregado, setAgregado] = useState(false);
  const cartScale = useRef(new Animated.Value(1)).current;
  const handleAgregarCarrito = () => {
    if (!onAgregarCarrito || agregado) return;
    onAgregarCarrito();
    setAgregado(true);
    Animated.sequence([
      Animated.spring(cartScale, { toValue: 1.35, useNativeDriver: true, speed: 40, bounciness: 12 }),
      Animated.spring(cartScale, { toValue: 1,    useNativeDriver: true, speed: 20 }),
    ]).start();
    setTimeout(() => setAgregado(false), 1600);
  };

  // --- Animación chat ---
  const msgScale = useRef(new Animated.Value(1)).current;
  const onMsgIn  = () => Animated.spring(msgScale, { toValue: 0.85, useNativeDriver: true, speed: 60, bounciness: 6 }).start();
  const onMsgOut = () => Animated.spring(msgScale, { toValue: 1,    useNativeDriver: true, speed: 20, bounciness: 10 }).start();

  // --- Animación favorito ---
  const heartScale = useRef(new Animated.Value(1)).current;
  const handleFavorito = () => {
    if (!onFavorito) return;
    onFavorito();
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true, speed: 50, bounciness: 14 }),
      Animated.spring(heartScale, { toValue: 1,   useNativeDriver: true, speed: 20 }),
    ]).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.88 : 1}
      style={[{
        backgroundColor: t.surface2,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: t.border,
        overflow: 'hidden',
      }, style]}
    >
      {/* ── BLOQUE IMAGEN ── */}
      <View style={{ width: '100%', aspectRatio: 1 }}>
        {/* Imagen o fallback gradiente */}
        {producto.imagen_url ? (
          <Image
            source={{ uri: producto.imagen_url }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name={icon} size={52} color="rgba(255,255,255,0.85)" />
          </LinearGradient>
        )}

        {/* Gradiente inferior sobre imagen */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.52)']}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 72 }}
          pointerEvents="none"
        />

        {/* Badge "Sin stock" o "Último" — top left */}
        {sinStock ? (
          <View style={{
            position: 'absolute', top: 10, left: 10,
            backgroundColor: 'rgba(107,114,128,0.85)',
            borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4,
          }}>
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.4 }}>SIN STOCK</Text>
          </View>
        ) : (producto.stock ?? 99) === 1 && (
          <View style={{
            position: 'absolute', top: 10, left: 10,
            backgroundColor: 'rgba(245,158,11,0.92)',
            borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4,
          }}>
            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.4 }}>ÚLTIMO</Text>
          </View>
        )}

        {/* Pill categoría — bottom left, sobre gradiente */}
        <View style={{
          position: 'absolute', bottom: 10, left: 10,
          backgroundColor: 'rgba(0,0,0,0.55)',
          borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4,
          borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.18)',
        }}>
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>
            {producto.categoria ?? 'Otro'}
          </Text>
        </View>

        {/* Botón Favorito — top right, círculo blanco */}
        {onFavorito && (
          <Animated.View style={{
            position: 'absolute', top: 10, right: 10, zIndex: 3,
            transform: [{ scale: heartScale }],
          }}>
            <TouchableOpacity
              onPress={handleFavorito}
              activeOpacity={0.8}
              style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: esFavorito ? 'rgba(255,77,109,0.18)' : 'rgba(255,255,255,0.95)',
                alignItems: 'center', justifyContent: 'center',
                shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.18, shadowRadius: 6, elevation: 4,
              }}
            >
              <Ionicons
                name={esFavorito ? 'heart' : 'heart-outline'}
                size={18}
                color={esFavorito ? '#FF4D6D' : '#1a1a1a'}
              />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Botón Carrito — bottom right, flota entre imagen e info */}
        {onAgregarCarrito && (
          <TouchableOpacity
            onPress={handleAgregarCarrito}
            activeOpacity={0.85}
            style={{
              position: 'absolute', bottom: -22, right: 14, zIndex: 5,
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: agregado ? '#34D399' : '#10B981',
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#059669',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.45, shadowRadius: 10,
              elevation: 10,
            }}
          >
            <Animated.View style={{ transform: [{ scale: cartScale }] }}>
              <Ionicons name={agregado ? 'checkmark' : 'cart'} size={20} color="#fff" />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>

      {/* ── BLOQUE INFO ── */}
      <View style={{
        paddingHorizontal: 12,
        paddingTop: onAgregarCarrito ? 30 : 12,
        paddingBottom: 14,
      }}>
        {/* Nombre */}
        <Text
          style={{ color: t.text, fontSize: 13, fontWeight: '700', lineHeight: 18 }}
          numberOfLines={2}
        >
          {producto.nombre}
        </Text>

        {/* Vendedor */}
        <TouchableOpacity
          onPress={onVerVendedor}
          disabled={!onVerVendedor}
          activeOpacity={onVerVendedor ? 0.7 : 1}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 5 }}
        >
          <Ionicons
            name="storefront-outline"
            size={10}
            color={onVerVendedor ? '#10B981' : t.textMuted}
          />
          <Text
            style={{ color: onVerVendedor ? '#10B981' : t.textMuted, fontSize: 10 }}
            numberOfLines={1}
          >
            {producto.perfiles?.nombre ?? 'Vendedor'}
          </Text>
          {onVerVendedor && <Ionicons name="chevron-forward" size={9} color="#10B981" />}
        </TouchableOpacity>

        {/* Rating */}
        {rating && rating.total > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <StarRating value={rating.promedio} size={10} />
            <Text style={{ color: t.textMuted, fontSize: 9 }}>
              {rating.promedio.toFixed(1)} ({rating.total})
            </Text>
          </View>
        )}

        {/* Badge fecha límite */}
        {fechaBadge && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5,
            alignSelf: 'flex-start',
            backgroundColor: fechaBadge.bg, borderRadius: 20,
            paddingHorizontal: 7, paddingVertical: 3,
          }}>
            <Ionicons name="time-outline" size={10} color={fechaBadge.color} />
            <Text style={{ color: fechaBadge.color, fontSize: 9, fontWeight: '700' }}>
              Límite: {fechaBadge.label}
            </Text>
          </View>
        )}

        {/* Precio + botón chat */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          justifyContent: 'space-between', marginTop: 8,
        }}>
          <Text style={{ color: t.text, fontSize: 17, fontWeight: '800' }}>
            {formatPrecio(Number(producto.precio))}
          </Text>

          {onContactar && (
            <Animated.View style={{ transform: [{ scale: msgScale }] }}>
              <TouchableOpacity
                onPress={onContactar}
                onPressIn={onMsgIn}
                onPressOut={onMsgOut}
                disabled={contactando}
                activeOpacity={1}
                style={{
                  width: 32, height: 32, borderRadius: 16,
                  backgroundColor: 'rgba(16,185,129,0.1)',
                  borderWidth: 1, borderColor: 'rgba(16,185,129,0.28)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                {contactando
                  ? <ActivityIndicator size={12} color="#10B981" />
                  : <Ionicons name="chatbubble-ellipses-outline" size={14} color="#10B981" />}
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
