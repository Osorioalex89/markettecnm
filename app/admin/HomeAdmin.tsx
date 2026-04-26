import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { fetchAdminStats, type AdminStats } from '../../services/adminService';

export default function HomeAdmin() {
  const { usuario } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const STAT_CARDS = [
    {
      label: 'Alumnos',
      value: stats?.totalUsuarios,
      icon: 'people' as const,
      colors: ['#FF8C55', '#FF6B2B'] as [string, string],
    },
    {
      label: 'Productos',
      value: stats?.totalProductos,
      icon: 'cube' as const,
      colors: ['#FFD060', '#FFB830'] as [string, string],
    },
    {
      label: 'Órdenes hoy',
      value: stats?.ordenesHoy,
      icon: 'trending-up' as const,
      colors: ['#FF8C55', '#FF6B2B'] as [string, string],
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A0A0A' }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={['#1C0800', '#111']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 16, paddingBottom: 28, paddingHorizontal: 20 }}
      >
        <LinearGradient
          colors={['rgba(255,184,48,0.08)', 'transparent']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          pointerEvents="none"
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: '#666',
                fontSize: 11,
                fontWeight: '600',
                letterSpacing: 2,
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Panel de Administración
            </Text>
            <Text style={{ color: '#F5F5F5', fontSize: 26, fontWeight: '800', letterSpacing: -0.3 }}>
              Hola, {usuario?.nombre?.split(' ')[0] ?? 'Admin'} 👋
            </Text>
          </View>

          <LinearGradient
            colors={['#FFB830', '#FF8C00']}
            style={{
              width: 50,
              height: 50,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#FFB830',
              shadowOpacity: 0.5,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <Ionicons name="shield-checkmark" size={24} color="#fff" />
          </LinearGradient>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 16, gap: 8 }}>
          <View
            style={{
              backgroundColor: 'rgba(255,184,48,0.12)',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(255,184,48,0.3)',
              paddingHorizontal: 12,
              paddingVertical: 5,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Ionicons name="checkmark-circle" size={12} color="#FFB830" />
            <Text style={{ color: '#FFB830', fontSize: 12, fontWeight: '700' }}>Administrador</Text>
          </View>
          <View
            style={{
              backgroundColor: '#1A1A1A',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#2E2E2E',
              paddingHorizontal: 12,
              paddingVertical: 5,
            }}
          >
            <Text style={{ color: '#555', fontSize: 12 }}>Tecnológico de Centla</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
        <Text
          style={{
            color: '#555',
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          Resumen del marketplace
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {STAT_CARDS.map((card) => (
            <View
              key={card.label}
              style={{
                flex: 1,
                backgroundColor: '#141414',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#2E2E2E',
                padding: 14,
                alignItems: 'center',
              }}
            >
              <LinearGradient
                colors={card.colors}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <Ionicons name={card.icon} size={17} color="#fff" />
              </LinearGradient>
              {cargando ? (
                <ActivityIndicator size="small" color="#444" />
              ) : (
                <Text style={{ color: '#F5F5F5', fontSize: 22, fontWeight: '800' }}>
                  {card.value ?? '—'}
                </Text>
              )}
              <Text style={{ color: '#555', fontSize: 10, marginTop: 3, textAlign: 'center' }}>
                {card.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Accesos rápidos */}
      <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
        <Text
          style={{
            color: '#555',
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          Módulos del panel
        </Text>

        {[
          {
            icon: 'people' as const,
            titulo: 'Usuarios',
            desc: 'Gestiona roles de alumnos registrados',
            colors: ['#FF8C55', '#FF6B2B'] as [string, string],
          },
          {
            icon: 'cube' as const,
            titulo: 'Productos',
            desc: 'Modera publicaciones del marketplace',
            colors: ['#FFD060', '#FFB830'] as [string, string],
          },
        ].map((item) => (
          <View
            key={item.titulo}
            style={{
              backgroundColor: '#141414',
              borderRadius: 18,
              borderWidth: 1,
              borderColor: '#222',
              overflow: 'hidden',
              marginBottom: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 }}>
              <LinearGradient
                colors={item.colors}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={item.icon} size={20} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#F5F5F5', fontWeight: '700', fontSize: 15 }}>
                  {item.titulo}
                </Text>
                <Text style={{ color: '#555', fontSize: 12, marginTop: 2 }}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#333" />
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}
