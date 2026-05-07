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
import { fetchTodosUsuarios, cambiarRolUsuario, eliminarCuenta } from '../../services/adminService';
import { useTheme } from '../../hooks/useTheme';
import type { Perfil } from '../../types';

const ROL_CONFIG = {
  comprador: { label: 'Comprador', color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  vendedor:  { label: 'Vendedor',  color: '#059669', bg: 'rgba(5,150,105,0.12)', border: 'rgba(5,150,105,0.3)' },
} as const;

export default function UsuariosAdmin() {
  const insets = useSafeAreaInsets();
  const t = useTheme();
  const [usuarios, setUsuarios] = useState<Perfil[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cambiando, setCambiando] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);

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

  const onEliminarCuenta = (usuario: Perfil) => {
    Alert.alert(
      'Eliminar cuenta',
      `¿Eliminar la cuenta de ${usuario.nombre}? Esta acción es permanente y no se puede deshacer. Se enviará una notificación al usuario.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setEliminando(usuario.id);
            try {
              await eliminarCuenta(usuario.id);
              setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la cuenta. Intenta de nuevo.');
            } finally {
              setEliminando(null);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Perfil }) => {
    const rol = item.rol in ROL_CONFIG ? (item.rol as keyof typeof ROL_CONFIG) : 'comprador';
    const config = ROL_CONFIG[rol];
    const esCambiando = cambiando === item.id;
    const esEliminando = eliminando === item.id;

    return (
      <View
        style={{
          backgroundColor: t.surface,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: t.border,
          marginBottom: 10,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={[config.color === '#10B981' ? 'rgba(16,185,129,0.06)' : 'rgba(5,150,105,0.06)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          pointerEvents="none"
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 }}>
          <LinearGradient
            colors={config.color === '#10B981' ? ['#34D399', '#10B981'] : ['#6EE7B7', '#34D399']}
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
            <Text style={{ color: t.text, fontSize: 14, fontWeight: '700' }} numberOfLines={1}>
              {item.nombre}
            </Text>
            <Text style={{ color: t.textMuted, fontSize: 12, marginTop: 2 }}>
              {item.matricula ?? 'Sin matrícula'}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
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
                onPress={() => onEliminarCuenta(item)}
                disabled={!!eliminando || !!cambiando}
                activeOpacity={0.7}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  backgroundColor: 'rgba(255,77,109,0.1)',
                  borderWidth: 1, borderColor: 'rgba(255,77,109,0.25)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                {esEliminando
                  ? <ActivityIndicator size={10} color="#FF4D6D" />
                  : <Ionicons name="trash-outline" size={13} color="#FF4D6D" />
                }
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => onCambiarRol(item)}
              disabled={esCambiando || !!eliminando}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: t.surface2,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: t.border,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              {esCambiando ? (
                <ActivityIndicator size={10} color={t.textMuted} />
              ) : (
                <Ionicons name="swap-horizontal-outline" size={12} color={t.textMuted} />
              )}
              <Text style={{ color: t.textMuted, fontSize: 10, fontWeight: '600' }}>
                {item.rol === 'comprador' ? 'Hacer vendedor' : 'Hacer comprador'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <LinearGradient
        colors={t.headerBg}
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}
      >
        <Text style={{ color: t.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>
          Administración
        </Text>
        <Text style={{ color: t.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.3 }}>
          Usuarios
        </Text>
        {!cargando && (
          <Text style={{ color: t.textMuted, fontSize: 13, marginTop: 4 }}>
            {usuarios.length} alumno{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
          </Text>
        )}
      </LinearGradient>

      {cargando ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#10B981" size="large" />
        </View>
      ) : (
        <FlatList
          data={usuarios}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 80 }}>
              <Ionicons name="people-outline" size={48} color={t.border} />
              <Text style={{ color: t.border, fontSize: 14, marginTop: 12 }}>
                No hay usuarios registrados
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
