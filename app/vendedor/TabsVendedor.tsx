import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { fetchTotalNoLeidos, suscribirseANoLeidosGlobal } from '../../services/chatService';
import InicioVendedor from './InicioVendedor';
import PublicarVendedor from './PublicarVendedor';
import VentasVendedor from './VentasVendedor';
import ListaChats from '../../components/ListaChats';

const Tab = createBottomTabNavigator();

type TabConfig = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  subtitulo: string;
  paso: string;
};

const TABS: TabConfig[] = [
  { name: 'Inicio', label: 'Inicio', icon: 'home-outline', iconActive: 'home', subtitulo: 'Tu feed y actividad reciente', paso: 'Paso 5' },
  { name: 'Publicar', label: 'Publicar', icon: 'add-circle-outline', iconActive: 'add-circle', subtitulo: 'Sube un nuevo producto', paso: 'Paso 6' },
  { name: 'Ventas', label: 'Mis ventas', icon: 'cube-outline', iconActive: 'cube', subtitulo: 'Historial y estado de pedidos', paso: 'Paso 6' },
  { name: 'Mensajes', label: 'Chat', icon: 'chatbubbles-outline', iconActive: 'chatbubbles', subtitulo: 'Conversa con tus compradores', paso: 'Paso 7' },
  { name: 'Perfil', label: 'Perfil', icon: 'person-outline', iconActive: 'person', subtitulo: 'Tu tienda y ajustes', paso: 'Paso 5' },
];

function PlaceholderScreen({ tab }: { tab: TabConfig }) {
  const { usuario, cerrarSesion } = useAuthStore();
  const isPerfil = tab.name === 'Perfil';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A0A0A' }}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero con gradiente */}
      <LinearGradient
        colors={['#1C0A00', '#0A0A0A']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ paddingTop: 64, paddingBottom: 32, paddingHorizontal: 24, alignItems: 'center' }}
      >
        <LinearGradient
          colors={['#FF8C55', '#FF6B2B', '#E05520']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 68,
            height: 68,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            shadowColor: '#FF6B2B',
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <Ionicons name={tab.iconActive} size={30} color="#fff" />
        </LinearGradient>
        <Text style={{ color: '#F5F5F5', fontSize: 26, fontWeight: '800', letterSpacing: -0.3 }}>
          {tab.name}
        </Text>
        <Text style={{ color: '#666', fontSize: 13, marginTop: 6, textAlign: 'center' }}>
          {tab.subtitulo}
        </Text>
      </LinearGradient>

      {/* Tarjeta de perfil */}
      {isPerfil && (
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          <View
            style={{
              backgroundColor: '#141414',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#2E2E2E',
              overflow: 'hidden',
            }}
          >
            <LinearGradient
              colors={['#FF6B2B', '#FFB830', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 2 }}
            />
            <View style={{ padding: 20 }}>
              {/* Avatar */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <LinearGradient
                  colors={['#FFB830', '#FF6B2B']}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>
                    {usuario?.nombre?.charAt(0).toUpperCase() ?? 'U'}
                  </Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#F5F5F5', fontSize: 17, fontWeight: '700' }}>
                    {usuario?.nombre}
                  </Text>
                  <Text style={{ color: '#666', fontSize: 13, marginTop: 2 }}>
                    {usuario?.matricula}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: 'rgba(255,184,48,0.12)',
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: 'rgba(255,184,48,0.3)',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ color: '#FFB830', fontSize: 11, fontWeight: '700' }}>
                    Vendedor
                  </Text>
                </View>
              </View>

              {[
                { icon: 'school-outline' as keyof typeof Ionicons.glyphMap, label: 'Institución', value: 'Tecnológico de Centla' },
                { icon: 'location-outline' as keyof typeof Ionicons.glyphMap, label: 'Sede', value: 'Villahermosa, Tabasco' },
              ].map((row) => (
                <View
                  key={row.label}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderTopWidth: 1,
                    borderTopColor: '#222',
                    gap: 12,
                  }}
                >
                  <Ionicons name={row.icon} size={16} color="#555" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#555', fontSize: 11 }}>{row.label}</Text>
                    <Text style={{ color: '#999', fontSize: 13, marginTop: 1 }}>{row.value}</Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                onPress={cerrarSesion}
                activeOpacity={0.8}
                style={{
                  marginTop: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  backgroundColor: 'rgba(255,77,109,0.1)',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: 'rgba(255,77,109,0.25)',
                  paddingVertical: 13,
                }}
              >
                <Ionicons name="log-out-outline" size={18} color="#FF4D6D" />
                <Text style={{ color: '#FF4D6D', fontWeight: '700', fontSize: 14 }}>
                  Cerrar sesión
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

export default function TabsVendedor() {
  const insets = useSafeAreaInsets();
  const { usuario } = useAuthStore();
  const [noLeidos, setNoLeidos] = useState(0);

  const actualizarBadge = useCallback(async () => {
    if (!usuario) return;
    try {
      const total = await fetchTotalNoLeidos(usuario.id);
      setNoLeidos(total);
    } catch { /* silencioso */ }
  }, [usuario]);

  useEffect(() => {
    actualizarBadge();
    if (!usuario) return;
    const canal = suscribirseANoLeidosGlobal(usuario.id, actualizarBadge);
    return () => { canal.unsubscribe(); };
  }, [usuario, actualizarBadge]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: '#141414' }}>
            <LinearGradient
              colors={['#FFB830', '#FF6B2B', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 1.5, position: 'absolute', top: 0, left: 0, right: 0 }}
            />
          </View>
        ),
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
          height: 64 + insets.bottom,
        },
        tabBarActiveTintColor: '#FFB830',
        tabBarInactiveTintColor: '#444',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
        tabBarIcon: ({ focused, color }) => {
          const tab = TABS.find((t) => t.name === route.name)!;
          return (
            <Ionicons
              name={focused ? tab.iconActive : tab.icon}
              size={22}
              color={color}
            />
          );
        },
      })}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          options={{
            tabBarLabel: tab.label,
            tabBarBadge: tab.name === 'Mensajes' && noLeidos > 0 ? noLeidos : undefined,
            tabBarBadgeStyle: { backgroundColor: '#FFB830', fontSize: 10, minWidth: 18, height: 18 },
          }}
        >
          {() =>
            tab.name === 'Inicio'    ? <InicioVendedor /> :
            tab.name === 'Publicar'  ? <PublicarVendedor /> :
            tab.name === 'Ventas'    ? <VentasVendedor /> :
            tab.name === 'Mensajes'  ? <ListaChats /> :
            <PlaceholderScreen tab={tab} />
          }
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
}
