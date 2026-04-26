import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchTodosUsuarios, cambiarRolUsuario } from '../../services/adminService';
import type { Perfil } from '../../types';

const ROL_CONFIG = {
  comprador: { label: 'Comprador', color: '#FF6B2B', bg: 'rgba(255,107,43,0.12)', border: 'rgba(255,107,43,0.3)' },
  vendedor:  { label: 'Vendedor',  color: '#FFB830', bg: 'rgba(255,184,48,0.12)', border: 'rgba(255,184,48,0.3)' },
} as const;

export default function UsuariosAdmin() {
  const insets = useSafeAreaInsets();
  const [usuarios, setUsuarios] = useState<Perfil[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cambiando, setCambiando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const data = await fetchTodosUsuarios();
      setUsuarios(data);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los usuarios.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const onCambiarRol = (usuario: Perfil) => {
    const nuevoRol = usuario.rol === 'comprador' ? 'vendedor' : 'comprador';
    const config = ROL_CONFIG[nuevoRol as keyof typeof ROL_CONFIG];
    Alert.alert(
      'Cambiar rol',
      `¿Cambiar a ${usuario.nombre} a ${config.label}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setCambiando(usuario.id);
            try {
              await cambiarRolUsuario(usuario.id, nuevoRol);
              setUsuarios((prev) =>
                prev.map((u) => (u.id === usuario.id ? { ...u, rol: nuevoRol } : u)),
              );
            } catch {
              Alert.alert('Error', 'No se pudo cambiar el rol.');
            } finally {
              setCambiando(null);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Perfil }) => {
    const rol = item.rol in ROL_CONFIG ? (item.rol as keyof typeof ROL_CONFIG) : 'comprador';
    const config = ROL_CONFIG[rol];
    const esCambiando = cambiando === item.id;

    return (
      <View
        style={{
          backgroundColor: '#141414',
          borderRadius: 18,
          borderWidth: 1,
          borderColor: '#222',
          marginBottom: 10,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={[config.color === '#FF6B2B' ? 'rgba(255,107,43,0.06)' : 'rgba(255,184,48,0.06)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          pointerEvents="none"
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 }}>
          <LinearGradient
            colors={config.color === '#FF6B2B' ? ['#FF8C55', '#FF6B2B'] : ['#FFD060', '#FFB830']}
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800' }}>
              {item.nombre.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>

          <View style={{ flex: 1 }}>
            <Text style={{ color: '#F5F5F5', fontSize: 14, fontWeight: '700' }} numberOfLines={1}>
              {item.nombre}
            </Text>
            <Text style={{ color: '#555', fontSize: 12, marginTop: 2 }}>
              {item.matricula ?? 'Sin matrícula'}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            <View
              style={{
                backgroundColor: config.bg,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: config.border,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text style={{ color: config.color, fontSize: 10, fontWeight: '700' }}>
                {config.label}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => onCambiarRol(item)}
              disabled={esCambiando}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#1A1A1A',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#2E2E2E',
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              {esCambiando ? (
                <ActivityIndicator size={10} color="#555" />
              ) : (
                <Ionicons name="swap-horizontal-outline" size={12} color="#555" />
              )}
              <Text style={{ color: '#555', fontSize: 10, fontWeight: '600' }}>
                {item.rol === 'comprador' ? 'Hacer vendedor' : 'Hacer comprador'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      <LinearGradient
        colors={['#1C0800', '#0A0A0A']}
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}
      >
        <Text style={{ color: '#666', fontSize: 11, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
          Administración
        </Text>
        <Text style={{ color: '#F5F5F5', fontSize: 24, fontWeight: '800', letterSpacing: -0.3 }}>
          Usuarios
        </Text>
        {!cargando && (
          <Text style={{ color: '#555', fontSize: 13, marginTop: 4 }}>
            {usuarios.length} alumno{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
          </Text>
        )}
      </LinearGradient>

      {cargando ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#FF6B2B" size="large" />
        </View>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <Ionicons name="people-outline" size={48} color="#2A2A2A" />
              <Text style={{ color: '#444', fontSize: 14, marginTop: 12 }}>
                No hay usuarios registrados
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
