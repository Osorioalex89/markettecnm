import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { fetchTotalNoLeidos, suscribirseANoLeidosGlobal } from '../../services/chatService';
import { useThemeStore } from '../../store/themeStore';
import { useTheme } from '../../hooks/useTheme';
import { useFavoritosStore } from '../../store/favoritosStore';
import InicioComprador from './InicioComprador';
import BuscarComprador from './BuscarComprador';
import CarritoComprador from './CarritoComprador';
import FavoritosComprador from './FavoritosComprador';
import ListaChats from '../../components/ListaChats';

const Tab = createBottomTabNavigator();

type TabConfig = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  subtitulo: string;
  paso: string;
  color: string;
};

const TABS: TabConfig[] = [
  { name: 'Inicio', label: 'Inicio', icon: 'home-outline', iconActive: 'home', subtitulo: 'Descubre productos frescos del campus', paso: 'Paso 5', color: '#10B981' },
  { name: 'Buscar', label: 'Buscar', icon: 'search-outline', iconActive: 'search', subtitulo: 'Busca y filtra lo que quieres', paso: 'Paso 5', color: '#059669' },
  { name: 'Favoritos', label: 'Guardados', icon: 'heart-outline', iconActive: 'heart', subtitulo: 'Tus productos guardados', paso: 'Paso 9', color: '#FF4D6D' },
  { name: 'Carrito', label: 'Carrito', icon: 'cart-outline', iconActive: 'cart', subtitulo: 'Revisa tu carrito antes de pagar', paso: 'Paso 6', color: '#10B981' },
  { name: 'Mensajes', label: 'Chat', icon: 'chatbubbles-outline', iconActive: 'chatbubbles', subtitulo: 'Habla con los vendedores', paso: 'Paso 7', color: '#059669' },
  { name: 'Perfil', label: 'Perfil', icon: 'person-outline', iconActive: 'person', subtitulo: 'Tus datos y ajustes', paso: 'Paso 5', color: '#10B981' },
];

function PlaceholderScreen() {
  const { usuario, cerrarSesion } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const t = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header: solo avatar */}
      <View style={{ backgroundColor: '#059669', paddingTop: 60, paddingBottom: 20, alignItems: 'center' }}>
        <View style={{
          width: 76, height: 76, borderRadius: 38,
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.45)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800' }}>
            {usuario?.nombre?.charAt(0).toUpperCase() ?? 'U'}
          </Text>
        </View>
      </View>

      {/* Tarjeta con info + toggle + logout */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <View style={{ backgroundColor: t.surface, borderRadius: 20, borderWidth: 1, borderColor: t.border, overflow: 'hidden' }}>
          <LinearGradient
            colors={['#10B981', '#059669', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 2 }}
          />
          <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 }}>
            {[
              { icon: 'school-outline' as keyof typeof Ionicons.glyphMap, label: 'Institución', value: 'Tecnológico de Centla' },
              { icon: 'location-outline' as keyof typeof Ionicons.glyphMap, label: 'Sede', value: 'Villahermosa, Tabasco' },
            ].map((row) => (
              <View key={row.label} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: t.border, gap: 12 }}>
                <Ionicons name={row.icon} size={16} color={t.textMuted} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: t.textMuted, fontSize: 11 }}>{row.label}</Text>
                  <Text style={{ color: t.textSecondary, fontSize: 13, marginTop: 1 }}>{row.value}</Text>
                </View>
              </View>
            ))}

            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: t.border, gap: 12 }}>
              <Ionicons name={isDark ? 'moon-outline' : 'sunny-outline'} size={16} color={t.textMuted} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.textMuted, fontSize: 11 }}>Apariencia</Text>
                <Text style={{ color: t.textSecondary, fontSize: 13, marginTop: 1 }}>{isDark ? 'Modo oscuro' : 'Modo claro'}</Text>
              </View>
              <Switch
                value={!isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#333', true: 'rgba(16,185,129,0.4)' }}
                thumbColor={isDark ? '#555' : '#10B981'}
              />
            </View>

            <TouchableOpacity
              onPress={cerrarSesion}
              activeOpacity={0.8}
              style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FF4D6D', borderRadius: 14, paddingVertical: 13 }}
            >
              <Ionicons name="log-out-outline" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export default function TabsComprador() {
  const { usuario } = useAuthStore();
  const isDark = useThemeStore((s) => s.isDark);
  const insets = useSafeAreaInsets();
  const [noLeidos, setNoLeidos] = useState(0);
  const { favoritos } = useFavoritosStore();
  const totalFavoritos = favoritos.size;

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
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom + 12,
          left: 44,
          right: 44,
          borderRadius: 28,
          height: 72,
          backgroundColor: isDark ? 'rgba(255,255,255,0.88)' : 'rgba(5,150,105,0.92)',
          borderWidth: 1,
          borderTopWidth: 1,
          borderColor: isDark ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.20)',
          shadowColor: isDark ? '#000' : '#059669',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.3 : 0.25,
          shadowRadius: 20,
          elevation: 20,
        },
        tabBarItemStyle: { paddingTop: 8, paddingBottom: 4 },
        tabBarActiveTintColor: isDark ? '#059669' : '#FFFFFF',
        tabBarInactiveTintColor: isDark ? '#9CA3AF' : 'rgba(255,255,255,0.55)',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
        tabBarIcon: ({ focused, color }) => {
          const tab = TABS.find((t) => t.name === route.name)!;
          return (
            <View style={{
              width: 46,
              height: 30,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 12,
              backgroundColor: focused
                ? (isDark ? 'rgba(5,150,105,0.12)' : 'rgba(255,255,255,0.18)')
                : 'transparent',
            }}>
              <Ionicons name={focused ? tab.iconActive : tab.icon} size={22} color={color} />
            </View>
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
            tabBarBadge:
              tab.name === 'Mensajes' && noLeidos > 0 ? noLeidos :
              tab.name === 'Favoritos' && totalFavoritos > 0 ? totalFavoritos :
              undefined,
            tabBarBadgeStyle: {
              backgroundColor: tab.name === 'Favoritos' ? '#FF4D6D' : (isDark ? '#10B981' : '#FFFFFF'),
              color: tab.name === 'Favoritos' ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#059669'),
              fontSize: 10, minWidth: 18, height: 18,
            },
          }}
        >
          {() =>
            tab.name === 'Inicio'      ? <InicioComprador /> :
            tab.name === 'Buscar'      ? <BuscarComprador /> :
            tab.name === 'Favoritos'   ? <FavoritosComprador /> :
            tab.name === 'Carrito'     ? <CarritoComprador /> :
            tab.name === 'Mensajes'    ? <ListaChats /> :
            <PlaceholderScreen />
          }
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
}
