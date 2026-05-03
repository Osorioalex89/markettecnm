import { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useBannerStore, TipoBanner } from '../store/bannerStore';

const BANNER_CONFIG: Record<
  TipoBanner,
  { fondo: string; icono: keyof typeof Ionicons.glyphMap }
> = {
  mensaje: { fondo: 'rgba(16,185,129,0.95)', icono: 'chatbubble-ellipses' },
  venta:   { fondo: 'rgba(5,150,105,0.95)',  icono: 'bag-check' },
  info:    { fondo: 'rgba(52,211,153,0.95)', icono: 'information-circle' },
  error:   { fondo: 'rgba(255,77,109,0.95)', icono: 'alert-circle' },
};

export default function InAppBanner() {
  const { visible, mensaje, tipo, ocultarBanner } = useBannerStore();
  const insets = useSafeAreaInsets();

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const config = BANNER_CONFIG[tipo];

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        transform: [{ translateY }],
        opacity,
        backgroundColor: config.fondo,
        paddingTop: insets.top + 10,
        paddingBottom: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
      }}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Ionicons
        name={config.icono}
        size={20}
        color="#fff"
        style={{ marginRight: 10, flexShrink: 0 }}
      />
      <Text
        style={{
          flex: 1,
          color: '#fff',
          fontWeight: '700',
          fontSize: 13,
          lineHeight: 18,
        }}
        numberOfLines={2}
      >
        {mensaje}
      </Text>
      <TouchableOpacity
        onPress={ocultarBanner}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{ marginLeft: 10, flexShrink: 0 }}
      >
        <Ionicons name="close" size={18} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
}
