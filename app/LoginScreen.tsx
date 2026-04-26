import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';

import type { Rol } from '../types';

type Modo = 'login' | 'registro';
type RolAlumno = Exclude<Rol, 'admin'>;

const ERRORES_ES: Record<string, string> = {
  'Invalid login credentials': 'Matrícula o contraseña incorrectos',
  'User already registered': 'Esta matrícula ya tiene una cuenta',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
  'Email rate limit exceeded': 'Demasiados intentos, espera un momento',
};

function traducirError(msg: string): string {
  for (const [key, val] of Object.entries(ERRORES_ES)) {
    if (msg.includes(key)) return val;
  }
  return msg || 'Ocurrió un error, intenta de nuevo';
}

function Campo({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  showToggle,
  autoCapitalize,
  returnKeyType,
  onSubmitEditing,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  showToggle?: boolean;
  autoCapitalize?: 'none' | 'words' | 'sentences';
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          color: '#999',
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#1E1E1E',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#2E2E2E',
          paddingHorizontal: 14,
        }}
      >
        <Ionicons name={icon} size={18} color="#666" style={{ marginRight: 10 }} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#444"
          secureTextEntry={showToggle ? !visible : secureTextEntry}
          autoCapitalize={autoCapitalize ?? 'none'}
          autoCorrect={false}
          returnKeyType={returnKeyType ?? 'next'}
          onSubmitEditing={onSubmitEditing}
          style={{
            flex: 1,
            color: '#F5F5F5',
            fontSize: 15,
            paddingVertical: 14,
          }}
        />
        {showToggle && (
          <TouchableOpacity onPress={() => setVisible((v) => !v)} activeOpacity={0.7} style={{ paddingLeft: 8 }}>
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function LoginScreen() {
  const [modo, setModo] = useState<Modo>('login');
  const [identificador, setIdentificador] = useState('');
  const [nombre, setNombre] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState<RolAlumno>('comprador');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, loginComoAdmin, registro } = useAuthStore();
  const esAdmin = identificador.toLowerCase().trim() === 'admin';

  const handleSubmit = async () => {
    setError(null);
    if (!identificador.trim()) { setError('Ingresa tu matrícula'); return; }
    if (!contrasena.trim()) { setError('Ingresa tu contraseña'); return; }
    if (modo === 'registro' && !esAdmin && !nombre.trim()) { setError('Ingresa tu nombre completo'); return; }
    if (contrasena.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }

    setCargando(true);
    try {
      if (esAdmin) {
        await loginComoAdmin(contrasena);
      } else if (modo === 'login') {
        await login(identificador.trim(), contrasena);
      } else {
        await registro(nombre.trim(), identificador.trim(), rol, contrasena);
      }
    } catch (e: any) {
      setError(traducirError(e?.message ?? ''));
    } finally {
      setCargando(false);
    }
  };

  const cambiarModo = (nuevoModo: Modo) => {
    setModo(nuevoModo);
    setError(null);
    setIdentificador('');
    setContrasena('');
    setNombre('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      {/* Fondo con gradiente cálido */}
      <LinearGradient
        colors={['#1C0A00', '#0A0A0A', '#0A0A0A']}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1 }}
      >
        {/* Glow sutil en la parte superior */}
        <LinearGradient
          colors={['rgba(255,107,43,0.12)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 280 }}
          pointerEvents="none"
        />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero / Logo */}
          <View style={{ alignItems: 'center', paddingTop: 64, paddingBottom: 36 }}>
            {/* Ícono con gradiente */}
            <LinearGradient
              colors={['#FF8C55', '#FF6B2B', '#E05520']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                shadowColor: '#FF6B2B',
                shadowOpacity: 0.6,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 8 },
                elevation: 16,
              }}
            >
              <Ionicons name="storefront" size={38} color="#fff" />
            </LinearGradient>

            <Text
              style={{
                color: '#F5F5F5',
                fontSize: 36,
                fontWeight: '800',
                letterSpacing: -0.5,
              }}
            >
              MarketTecnm
            </Text>
            <Text
              style={{
                color: '#666',
                fontSize: 12,
                marginTop: 4,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              Tecnológico de Centla
            </Text>
          </View>

          {/* Card glassmorphism */}
          <View
            style={{
              marginHorizontal: 20,
              backgroundColor: 'rgba(20,20,20,0.95)',
              borderRadius: 28,
              borderWidth: 1,
              borderColor: 'rgba(255,107,43,0.2)',
              overflow: 'hidden',
              shadowColor: '#FF6B2B',
              shadowOpacity: 0.15,
              shadowRadius: 40,
              shadowOffset: { width: 0, height: 0 },
              elevation: 12,
            }}
          >
            {/* Línea gradiente superior */}
            <LinearGradient
              colors={['#FF6B2B', '#FFB830', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 2 }}
            />

            <View style={{ padding: 24 }}>
              {/* Tabs login / registro */}
              {!esAdmin && (
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: '#1A1A1A',
                    borderRadius: 16,
                    padding: 4,
                    marginBottom: 24,
                  }}
                >
                  {(['login', 'registro'] as Modo[]).map((m) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => cambiarModo(m)}
                      activeOpacity={0.8}
                      style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}
                    >
                      {modo === m ? (
                        <LinearGradient
                          colors={['#FF6B2B', '#E05520']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={{ paddingVertical: 10, alignItems: 'center', borderRadius: 12 }}
                        >
                          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
                            {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                          <Text style={{ color: '#666', fontWeight: '600', fontSize: 13 }}>
                            {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Admin badge */}
              {esAdmin && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,184,48,0.1)',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(255,184,48,0.3)',
                    padding: 12,
                    marginBottom: 20,
                    gap: 8,
                  }}
                >
                  <Ionicons name="shield-checkmark" size={18} color="#FFB830" />
                  <Text style={{ color: '#FFB830', fontWeight: '600', fontSize: 13 }}>
                    Modo Administrador activado
                  </Text>
                </View>
              )}

              {/* Nombre — solo registro alumno */}
              {modo === 'registro' && !esAdmin && (
                <Campo
                  label="Nombre completo"
                  icon="person-outline"
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Ej. Juan García López"
                  autoCapitalize="words"
                />
              )}

              {/* Matrícula */}
              <Campo
                label={esAdmin ? 'Usuario' : 'Matrícula'}
                icon={esAdmin ? 'key-outline' : 'card-outline'}
                value={identificador}
                onChangeText={setIdentificador}
                placeholder={esAdmin ? 'admin' : 'Ej. 21TEC0001'}
              />

              {/* Selector de rol */}
              {!esAdmin && (
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: '#999',
                      fontSize: 11,
                      fontWeight: '600',
                      letterSpacing: 1.5,
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    Rol
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    {[
                      { value: 'comprador' as RolAlumno, label: 'Comprador', icon: 'bag-handle-outline' as keyof typeof Ionicons.glyphMap },
                      { value: 'vendedor' as RolAlumno, label: 'Vendedor', icon: 'storefront-outline' as keyof typeof Ionicons.glyphMap },
                    ].map(({ value, label, icon }) => (
                      <TouchableOpacity
                        key={value}
                        onPress={() => setRol(value)}
                        activeOpacity={0.8}
                        style={{ flex: 1, borderRadius: 14, overflow: 'hidden' }}
                      >
                        {rol === value ? (
                          <LinearGradient
                            colors={['#FF6B2B', '#E05520']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                              paddingVertical: 12,
                              alignItems: 'center',
                              borderRadius: 14,
                              gap: 4,
                            }}
                          >
                            <Ionicons name={icon} size={20} color="#fff" />
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>
                              {label}
                            </Text>
                          </LinearGradient>
                        ) : (
                          <View
                            style={{
                              paddingVertical: 12,
                              alignItems: 'center',
                              borderRadius: 14,
                              borderWidth: 1,
                              borderColor: '#2E2E2E',
                              backgroundColor: '#1E1E1E',
                              gap: 4,
                            }}
                          >
                            <Ionicons name={icon} size={20} color="#555" />
                            <Text style={{ color: '#666', fontWeight: '600', fontSize: 12 }}>
                              {label}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Contraseña */}
              <Campo
                label="Contraseña"
                icon="lock-closed-outline"
                value={contrasena}
                onChangeText={setContrasena}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                showToggle
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />

              {/* Error */}
              {error && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,77,109,0.1)',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(255,77,109,0.3)',
                    padding: 12,
                    marginBottom: 16,
                    gap: 8,
                  }}
                >
                  <Ionicons name="alert-circle-outline" size={16} color="#FF4D6D" />
                  <Text style={{ color: '#FF4D6D', fontSize: 13, flex: 1 }}>{error}</Text>
                </View>
              )}

              {/* Botón submit */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={cargando}
                activeOpacity={0.85}
                style={{ borderRadius: 18, overflow: 'hidden', marginTop: 4 }}
              >
                <LinearGradient
                  colors={cargando ? ['#7A3010', '#7A3010'] : ['#FF6B2B', '#E05520']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingVertical: 16,
                    alignItems: 'center',
                    shadowColor: '#FF6B2B',
                    shadowOpacity: 0.5,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 6 },
                  }}
                >
                  {cargando ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text
                      style={{
                        color: '#fff',
                        fontWeight: '800',
                        fontSize: 15,
                        letterSpacing: 0.3,
                      }}
                    >
                      {esAdmin
                        ? 'Entrar como Administrador'
                        : modo === 'login'
                        ? 'Entrar'
                        : 'Crear cuenta'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Hint admin */}
              {!esAdmin && (
                <Text
                  style={{
                    color: '#555',
                    fontSize: 12,
                    textAlign: 'center',
                    marginTop: 20,
                    lineHeight: 18,
                  }}
                >
                  ¿Eres administrador?{' '}
                  <Text
                    style={{ color: '#FFB830' }}
                    onPress={() => setIdentificador('admin')}
                  >
                    Toca aquí
                  </Text>
                </Text>
              )}
            </View>
          </View>

          {/* Footer */}
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <Text style={{ color: '#333', fontSize: 11, letterSpacing: 1 }}>
              SOLO PARA ALUMNOS Y STAFF · TECNM
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
