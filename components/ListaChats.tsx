import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/authStore';
import { fetchConversaciones, type ConversacionConDetalle } from '../services/chatService';

function tiempoRelativo(iso: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  return `hace ${Math.floor(hrs / 24)} d`;
}

export default function ListaChats() {
  const { usuario } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [conversaciones, setConversaciones] = useState<ConversacionConDetalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async () => {
    if (!usuario) return;
    try {
      const data = await fetchConversaciones(usuario.id);
      setConversaciones(data);
    } catch {
      // silencioso
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [usuario]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const onRefresh = () => {
    setRefrescando(true);
    cargar();
  };

  if (cargando) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#FF6B2B" size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      {/* Header */}
      <LinearGradient
        colors={['#1C0A00', '#0A0A0A']}
        style={{ paddingTop: 56, paddingBottom: 20, paddingHorizontal: 24 }}
      >
        <Text style={{ color: '#F5F5F5', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>
          Mensajes
        </Text>
        <Text style={{ color: '#555', fontSize: 13, marginTop: 4 }}>
          {conversaciones.length > 0
            ? `${conversaciones.length} conversación${conversaciones.length !== 1 ? 'es' : ''}`
            : 'Sin conversaciones aún'}
        </Text>
      </LinearGradient>

      {conversaciones.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
          <LinearGradient
            colors={['#FF8C55', '#FF6B2B', '#E05520']}
            style={{
              width: 72,
              height: 72,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              opacity: 0.7,
            }}
          >
            <Ionicons name="chatbubbles" size={32} color="#fff" />
          </LinearGradient>
          <Text style={{ color: '#F5F5F5', fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
            Sin mensajes
          </Text>
          <Text style={{ color: '#555', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
            Tus conversaciones con vendedores aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversaciones}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={onRefresh}
              tintColor="#FF6B2B"
              colors={['#FF6B2B']}
            />
          }
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: '#141414', marginHorizontal: 4 }} />
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('ChatScreen', {
                  conversacionId: item.id,
                  otroNombre: item.otro.nombre,
                  otroId: item.otro.id,
                  destinatarioId: item.otro.id,
                })
              }
              activeOpacity={0.75}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                paddingHorizontal: 4,
                gap: 12,
              }}
            >
              {/* Avatar */}
              <LinearGradient
                colors={['#FF8C55', '#FF6B2B']}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
                  {item.otro.nombre.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>

              {/* Info */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text
                    style={{
                      color: item.no_leidos > 0 ? '#F5F5F5' : '#BDBDBD',
                      fontSize: 15,
                      fontWeight: item.no_leidos > 0 ? '700' : '500',
                    }}
                    numberOfLines={1}
                  >
                    {item.otro.nombre}
                  </Text>
                  <Text style={{ color: '#444', fontSize: 11 }}>
                    {tiempoRelativo(item.ultimo_en)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 6 }}>
                  <Text
                    style={{
                      color: item.no_leidos > 0 ? '#999' : '#444',
                      fontSize: 13,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {item.ultimo_mensaje ?? 'Inicia la conversación'}
                  </Text>
                  {item.no_leidos > 0 && (
                    <View
                      style={{
                        backgroundColor: '#FF6B2B',
                        borderRadius: 10,
                        minWidth: 20,
                        height: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 5,
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                        {item.no_leidos}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <Ionicons name="chevron-forward" size={16} color="#333" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}