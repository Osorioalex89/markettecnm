import './global.css';
import { useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

import { supabase } from './services/supabase';
import { obtenerPerfil } from './services/authService';
import { useAuthStore } from './store/authStore';
import { useBannerStore } from './store/bannerStore';
import { useTheme } from './hooks/useTheme';
import { useThemeStore } from './store/themeStore';
import InAppBanner from './components/InAppBanner';

import LoginScreen from './app/LoginScreen';
import TabsComprador from './app/comprador/TabsComprador';
import TabsVendedor from './app/vendedor/TabsVendedor';
import TabsAdmin from './app/admin/TabsAdmin';
import ChatScreen from './app/ChatScreen';
import PerfilVendedor from './app/PerfilVendedor';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color="#10B981" size="large" />
    </View>
  );
}

export default function App() {
  const { usuario, sesionCargando, setUsuario, setSesionCargando } = useAuthStore();
  const { mostrarBanner } = useBannerStore();
  const t = useTheme();
  const isDark = useThemeStore((s) => s.isDark);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const perfil = await obtenerPerfil(session.user.id);
          setUsuario(perfil);
        } catch {
          await supabase.auth.signOut();
        }
      }
      setSesionCargando(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUsuario(null);
          setSesionCargando(false);
          return;
        }
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          let perfil = null;
          for (let intento = 0; intento < 3; intento++) {
            try {
              perfil = await obtenerPerfil(session.user.id);
              break;
            } catch {
              if (intento < 2) await new Promise((r) => setTimeout(r, 600));
            }
          }
          if (perfil) {
            setUsuario(perfil);
          } else {
            await supabase.auth.signOut();
          }
          setSesionCargando(false);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  // Setup push notifications cuando el usuario inicia sesión
  useEffect(() => {
    if (!usuario) return;

    async function setupPush() {
      try {
        const { status: existente } = await Notifications.getPermissionsAsync();
        let estado = existente;

        if (existente !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          estado = status;
        }

        if (estado !== 'granted') return;

        const tokenData = await Notifications.getExpoPushTokenAsync();
        const token = tokenData.data;

        await supabase
          .from('perfiles')
          .update({ expo_push_token: token })
          .eq('id', usuario!.id);

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
          });
        }
      } catch {
        // Push no disponible en este entorno (simulador, permisos denegados, etc.)
      }
    }

    setupPush();
  }, [usuario?.id]);

  // Suscripción Realtime para notificaciones in-app de nuevos mensajes
  useEffect(() => {
    if (!usuario) return;

    const canal = supabase
      .channel(`nuevos_mensajes_${usuario.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
        },
        (payload) => {
          const msg = payload.new as { remitente_id: string; contenido: string };
          if (msg.remitente_id !== usuario.id) {
            mostrarBanner(`Nuevo mensaje: "${msg.contenido.slice(0, 40)}..."`, 'mensaje');
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [usuario?.id]);

  if (sesionCargando) return <LoadingScreen />;

  return (
    <SafeAreaProvider>
      <InAppBanner />
      <NavigationContainer>
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={t.bg} />
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
          {!usuario ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : usuario.rol === 'comprador' ? (
            <Stack.Screen name="TabsComprador" component={TabsComprador} />
          ) : usuario.rol === 'vendedor' ? (
            <Stack.Screen name="TabsVendedor" component={TabsVendedor} />
          ) : usuario.rol === 'admin' ? (
            <Stack.Screen name="HomeAdmin" component={TabsAdmin} />
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
          <Stack.Screen
            name="ChatScreen"
            component={ChatScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="PerfilVendedor"
            component={PerfilVendedor}
            options={{ animation: 'slide_from_right' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}