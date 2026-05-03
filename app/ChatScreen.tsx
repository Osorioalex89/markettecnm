import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import {
  fetchMensajes,
  enviarMensaje,
  marcarLeidos,
  suscribirseAMensajes,
} from '../services/chatService';
import type { Mensaje } from '../types';

type ChatParams = {
  ChatScreen: {
    conversacionId: string;
    otroNombre: string;
    otroId: string;
  };
};

function formatHora(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function formatFecha(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);
  if (d.toDateString() === hoy.toDateString()) return 'Hoy';
  if (d.toDateString() === ayer.toDateString()) return 'Ayer';
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

export default function ChatScreen() {
  const { usuario } = useAuthStore();
  const t = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ChatParams, 'ChatScreen'>>();
  const { conversacionId, otroNombre, otroId } = route.params;
  const insets = useSafeAreaInsets();

  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const cargarMensajes = useCallback(async () => {
    if (!usuario) return;
    try {
      const data = await fetchMensajes(conversacionId);
      setMensajes(data);
      await marcarLeidos(conversacionId, usuario.id);
    } catch {
      // silencioso
    } finally {
      setCargando(false);
    }
  }, [conversacionId, usuario]);

  useEffect(() => {
    cargarMensajes();

    const canal = suscribirseAMensajes(conversacionId, (nuevoMsg) => {
      setMensajes((prev) => {
        if (prev.some((m) => m.id === nuevoMsg.id)) return prev;
        return [...prev, nuevoMsg];
      });
      if (usuario && nuevoMsg.remitente_id !== usuario.id) {
        marcarLeidos(conversacionId, usuario.id);
      }
    });

    return () => {
      canal.unsubscribe();
    };
  }, [conversacionId, usuario, cargarMensajes]);

  useEffect(() => {
    if (mensajes.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [mensajes]);

  const enviar = async () => {
    if (!texto.trim() || !usuario || enviando) return;
    const contenido = texto.trim();
    setTexto('');
    setEnviando(true);

    const tempId = `temp-${Date.now()}`;
    const mensajeOptimista: Mensaje = {
      id: tempId,
      conversacion_id: conversacionId,
      remitente_id: usuario.id,
      contenido,
      enviado_en: new Date().toISOString(),
      leido: false,
    };
    setMensajes((prev) => [...prev, mensajeOptimista]);

    try {
      const mensajeReal = await enviarMensaje(conversacionId, usuario.id, contenido, otroId);
      setMensajes((prev) => {
        // Si Realtime ya lo agregó antes de que resolviera el await, solo quitar el temp
        if (prev.some((m) => m.id === mensajeReal.id)) {
          return prev.filter((m) => m.id !== tempId);
        }
        return prev.map((m) => (m.id === tempId ? mensajeReal : m));
      });
    } catch {
      setMensajes((prev) => prev.filter((m) => m.id !== tempId));
      setTexto(contenido);
    } finally {
      setEnviando(false);
    }
  };

  // Agrupa mensajes por fecha para separadores
  const renderItem = ({ item, index }: { item: Mensaje; index: number }) => {
    const esMio = item.remitente_id === usuario?.id;
    const anterior = index > 0 ? mensajes[index - 1] : null;
    const fechaActual = formatFecha(item.enviado_en);
    const fechaAnterior = anterior ? formatFecha(anterior.enviado_en) : null;
    const mostrarFecha = fechaActual !== fechaAnterior;

    return (
      <>
        {mostrarFecha && (
          <View style={{ alignItems: 'center', marginVertical: 12 }}>
            <View
              style={{
                backgroundColor: t.surface2,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: t.textMuted, fontSize: 11 }}>{fechaActual}</Text>
            </View>
          </View>
        )}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: esMio ? 'flex-end' : 'flex-start',
            marginBottom: 6,
            paddingHorizontal: 16,
          }}
        >
          <View style={{ maxWidth: '75%' }}>
            {esMio ? (
              <LinearGradient
                colors={['#34D399', '#10B981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 18,
                  borderBottomRightRadius: 4,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 14, lineHeight: 20 }}>
                  {item.contenido}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 4, textAlign: 'right' }}>
                  {formatHora(item.enviado_en)}
                </Text>
              </LinearGradient>
            ) : (
              <View
                style={{
                  backgroundColor: t.surface2,
                  borderRadius: 18,
                  borderBottomLeftRadius: 4,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: t.border,
                }}
              >
                <Text style={{ color: t.text, fontSize: 14, lineHeight: 20 }}>
                  {item.contenido}
                </Text>
                <Text style={{ color: t.textMuted, fontSize: 10, marginTop: 4 }}>
                  {formatHora(item.enviado_en)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Header */}
      <LinearGradient
        colors={t.headerBg}
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: t.border,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: t.surface2,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="chevron-back" size={20} color={t.text} />
        </TouchableOpacity>

        <LinearGradient
          colors={['#34D399', '#10B981']}
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
            {otroNombre.charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>

        <View style={{ flex: 1 }}>
          <Text style={{ color: t.text, fontSize: 16, fontWeight: '700' }} numberOfLines={1}>
            {otroNombre}
          </Text>
          <Text style={{ color: '#10B981', fontSize: 11, marginTop: 1 }}>En línea</Text>
        </View>
      </LinearGradient>

      {/* Mensajes + input dentro del KAV para que el teclado empuje todo */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Fondo con gradiente diagonal + blobs decorativos */}
        <LinearGradient
          colors={[t.gradientHero[0], t.bg, t.bg]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          pointerEvents="none"
        />
        <View pointerEvents="none" style={{
          position: 'absolute', top: 40, right: -50,
          width: 220, height: 220, borderRadius: 110,
          backgroundColor: '#10B981', opacity: 0.04,
        }} />
        <View pointerEvents="none" style={{
          position: 'absolute', bottom: 120, left: -70,
          width: 260, height: 260, borderRadius: 130,
          backgroundColor: '#10B981', opacity: 0.03,
        }} />

        {cargando ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#10B981" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={mensajes}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
                <Ionicons name="chatbubbles-outline" size={48} color={t.textMuted} />
                <Text style={{ color: t.textMuted, fontSize: 14, marginTop: 12 }}>
                  Inicia la conversación
                </Text>
              </View>
            }
          />
        )}

        {/* Input */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            paddingHorizontal: 12,
            paddingTop: 10,
            paddingBottom: insets.bottom + 10,
            borderTopWidth: 1,
            borderTopColor: t.border,
            backgroundColor: t.bg,
            gap: 8,
          }}
        >
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={t.textMuted}
            multiline
            style={{
              flex: 1,
              backgroundColor: t.surface,
              borderWidth: 1,
              borderColor: t.border,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingTop: 10,
              paddingBottom: 10,
              color: t.text,
              fontSize: 14,
              maxHeight: 100,
            }}
          />
          <TouchableOpacity
            onPress={enviar}
            disabled={!texto.trim() || enviando}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={texto.trim() ? ['#34D399', '#10B981'] : ['#222', '#222']}
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {enviando ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={18} color={texto.trim() ? '#fff' : '#444'} />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}