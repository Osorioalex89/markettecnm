import {
  Modal,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
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
  'Electrónica': ['#34D399', '#10B981'],
  'Útiles':      ['#6EE7B7', '#34D399'],
  'Libros':      ['#60B8FF', '#3A8FD6'],
  'Accesorios':  ['#B860FF', '#8C3AD6'],
  'Ropa':        ['#FF60A8', '#D63A7A'],
  'Alimentos':   ['#A7F3D0', '#6EE7B7'],
  'Servicios':   ['#34D399', '#059669'],
};

function formatPrecio(precio: number): string {
  return `$${precio.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

type Props = {
  producto: ProductoConVendedor | null;
  visible: boolean;
  onClose: () => void;
  onAgregarCarrito?: () => void;
  onContactar?: () => void;
  contactando?: boolean;
  onVerVendedor?: () => void;
};

export default function ProductoDetalle({
  producto,
  visible,
  onClose,
  onAgregarCarrito,
  onContactar,
  contactando,
  onVerVendedor,
}: Props) {
  const insets = useSafeAreaInsets();
  const t = useTheme();

  if (!producto) return null;

  const icon = CATEGORIA_ICON[producto.categoria ?? ''] ?? 'pricetag-outline';
  const colors = CATEGORIA_COLORS[producto.categoria ?? ''] ?? ['#34D399', '#10B981'];
  const stockBajo = (producto.stock ?? 0) <= 1;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Overlay oscuro tocable para cerrar */}
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' }}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Sheet */}
      <View
        style={{
          backgroundColor: t.surface,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          maxHeight: '88%',
          overflow: 'hidden',
        }}
      >
        {/* Handle */}
        <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: t.border }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {/* Imagen o gradiente fallback */}
          {producto.imagen_url ? (
            <View style={{ width: '100%', height: 280, backgroundColor: t.surface2 }}>
              <Image
                source={{ uri: producto.imagen_url }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', t.surface + 'D9']}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 }}
                pointerEvents="none"
              />
            </View>
          ) : (
            <LinearGradient
              colors={[colors[0], colors[1]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: '100%', height: 200, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name={icon} size={72} color="rgba(255,255,255,0.9)" />
            </LinearGradient>
          )}

          {/* Contenido */}
          <View style={{ padding: 20 }}>
            {/* Fila: categoría + stock */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              {producto.categoria && (
                <View
                  style={{
                    backgroundColor: t.surface2,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: t.border,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ color: t.textMuted, fontSize: 11, fontWeight: '600' }}>
                    {producto.categoria}
                  </Text>
                </View>
              )}
              <View
                style={{
                  backgroundColor: stockBajo ? 'rgba(255,77,109,0.12)' : 'rgba(77,255,166,0.08)',
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: stockBajo ? 'rgba(255,77,109,0.3)' : 'rgba(77,255,166,0.2)',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    color: stockBajo ? '#FF4D6D' : '#4DFFA6',
                    fontSize: 11,
                    fontWeight: '600',
                  }}
                >
                  {stockBajo ? 'Último disponible' : `${producto.stock ?? 0} en stock`}
                </Text>
              </View>
            </View>

            {/* Nombre */}
            <Text
              style={{
                color: t.text,
                fontSize: 22,
                fontWeight: '800',
                letterSpacing: -0.3,
                lineHeight: 28,
              }}
            >
              {producto.nombre}
            </Text>

            {/* Precio */}
            <Text
              style={{
                color: '#10B981',
                fontSize: 30,
                fontWeight: '800',
                marginTop: 8,
                letterSpacing: -0.5,
              }}
            >
              {formatPrecio(Number(producto.precio))}
            </Text>

            {/* Vendedor */}
            <TouchableOpacity
              onPress={onVerVendedor}
              disabled={!onVerVendedor}
              activeOpacity={onVerVendedor ? 0.75 : 1}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginTop: 14,
                backgroundColor: t.surface2,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: onVerVendedor ? 'rgba(16,185,129,0.3)' : t.border,
                padding: 12,
              }}
            >
              <LinearGradient
                colors={['#34D399', '#10B981']}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>
                  {(producto.perfiles?.nombre ?? 'V').charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.text, fontSize: 13, fontWeight: '700' }}>
                  {producto.perfiles?.nombre ?? 'Vendedor'}
                </Text>
                {producto.perfiles?.matricula && (
                  <Text style={{ color: t.textMuted, fontSize: 11, marginTop: 1 }}>
                    {producto.perfiles.matricula}
                  </Text>
                )}
              </View>
              {onVerVendedor ? (
                <LinearGradient
                  colors={['rgba(16,185,129,0.15)', 'rgba(16,185,129,0.08)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
                    paddingHorizontal: 8, paddingVertical: 3,
                    flexDirection: 'row', alignItems: 'center', gap: 3,
                  }}
                >
                  <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '700' }}>Ver perfil</Text>
                  <Ionicons name="chevron-forward" size={10} color="#10B981" />
                </LinearGradient>
              ) : (
                <View
                  style={{
                    backgroundColor: 'rgba(16,185,129,0.1)',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(16,185,129,0.25)',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '700' }}>Vendedor</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Descripción */}
            {producto.descripcion ? (
              <View style={{ marginTop: 18 }}>
                <Text
                  style={{
                    color: t.textMuted,
                    fontSize: 11,
                    fontWeight: '600',
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  Descripción
                </Text>
                <Text style={{ color: t.textSecondary, fontSize: 14, lineHeight: 22 }}>
                  {producto.descripcion}
                </Text>
              </View>
            ) : (
              <View style={{ marginTop: 18 }}>
                <Text style={{ color: t.border, fontSize: 13, fontStyle: 'italic' }}>
                  Sin descripción
                </Text>
              </View>
            )}

            {/* Espaciado para los botones */}
            <View style={{ height: 24 }} />
          </View>
        </ScrollView>

        {/* Botones de acción — fijos al fondo */}
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: insets.bottom + 16,
            borderTopWidth: 1,
            borderTopColor: t.border,
            backgroundColor: t.surface,
          }}
        >
          {onContactar && (
            <TouchableOpacity
              onPress={() => { onContactar(); onClose(); }}
              disabled={contactando}
              activeOpacity={0.8}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                backgroundColor: 'rgba(16,185,129,0.12)',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(16,185,129,0.3)',
                paddingVertical: 14,
              }}
            >
              {contactando ? (
                <ActivityIndicator size={16} color="#10B981" />
              ) : (
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#10B981" />
              )}
              <Text style={{ color: '#10B981', fontWeight: '700', fontSize: 14 }}>
                Contactar
              </Text>
            </TouchableOpacity>
          )}

          {onAgregarCarrito && (
            <TouchableOpacity
              onPress={() => { onAgregarCarrito(); onClose(); }}
              activeOpacity={0.8}
              style={{ flex: onContactar ? 1.4 : 1, borderRadius: 16, overflow: 'hidden' }}
            >
              <LinearGradient
                colors={['#34D399', '#10B981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 14,
                }}
              >
                <Ionicons name="cart-outline" size={18} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                  Agregar al carrito
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
