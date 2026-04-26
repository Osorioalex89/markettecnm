import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import HomeAdmin from './HomeAdmin';
import UsuariosAdmin from './UsuariosAdmin';
import ProductosAdmin from './ProductosAdmin';

const Tab = createBottomTabNavigator();

type TabConfig = {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

const TABS: TabConfig[] = [
  { name: 'Panel',     label: 'Panel',     icon: 'grid-outline',    iconActive: 'grid' },
  { name: 'Usuarios',  label: 'Usuarios',  icon: 'people-outline',  iconActive: 'people' },
  { name: 'Productos', label: 'Productos', icon: 'cube-outline',    iconActive: 'cube' },
  { name: 'Perfil',    label: 'Perfil',    icon: 'person-outline',  iconActive: 'person' },
];

function PerfilAdmin() {
  const { usuario, cerrarSesion } = useAuthStore();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#0A0A0A' }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#1C0800', '#0A0A0A']}
        style={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 20 }}
      >
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
          Administración
        </Text>
        <Text style={{ color: '#F5F5F5', fontSize: 24, fontWeight: '800', letterSpacing: -0.3 }}>
          Mi perfil
        </Text>
      </LinearGradient>

      <View style={{ paddingHorizontal: 20 }}>
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
            colors={['#FFB830', '#FF6B2B', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 2 }}
          />
          <View style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <LinearGradient
                colors={['#FFB830', '#FF8C00']}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="shield-checkmark" size={24} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#F5F5F5', fontSize: 17, fontWeight: '700' }}>
                  {usuario?.nombre ?? 'Administrador'}
                </Text>
                <Text style={{ color: '#666', fontSize: 13, marginTop: 2 }}>
                  {usuario?.matricula ?? 'admin'}
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
                <Text style={{ color: '#FFB830', fontSize: 11, fontWeight: '700' }}>Admin</Text>
              </View>
            </View>

            {[
              {
                icon: 'school-outline' as keyof typeof Ionicons.glyphMap,
                label: 'Institución',
                value: 'Tecnológico de Centla',
              },
              {
                icon: 'location-outline' as keyof typeof Ionicons.glyphMap,
                label: 'Sede',
                value: 'Villahermosa, Tabasco',
              },
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

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

export default function TabsAdmin() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F0F0F',
          borderTopColor: '#1A1A1A',
          borderTopWidth: 1,
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
        <Tab.Screen key={tab.name} name={tab.name} options={{ tabBarLabel: tab.label }}>
          {() =>
            tab.name === 'Panel'     ? <HomeAdmin /> :
            tab.name === 'Usuarios'  ? <UsuariosAdmin /> :
            tab.name === 'Productos' ? <ProductosAdmin /> :
            <PerfilAdmin />
          }
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
}
