import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/authStore';
import { crearReporte, type TipoReporte } from '../services/reportesService';

const MOTIVOS = [
  'Contenido inapropiado',
  'Spam o publicidad engañosa',
  'Precio abusivo',
  'Acoso o comportamiento ofensivo',
  'Otro',
];

type Props = {
  visible: boolean;
  onClose: () => void;
  tipo: TipoReporte;
  referenciaId: string;
};

export default function ReporteModal({ visible, onClose, tipo, referenciaId }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { usuario } = useAuthStore();
  const [motivoSeleccionado, setMotivoSeleccionado] = useState('');
  const [detalle, setDetalle] = useState('');
  const [enviando, setEnviando] = useState(false);

  const TIPO_LABEL: Record<TipoReporte, string> = {
    producto: 'producto',
    usuario: 'usuario',
    chat: 'conversación',
  };

  const reset = () => {
    setMotivoSeleccionado('');
    setDetalle('');
  };

  const cerrar = () => {
    reset();
    onClose();
  };

  const enviar = async () => {
    if (!motivoSeleccionado || !usuario) return;
    setEnviando(true);
    try {
      const motivo = detalle.trim()
        ? `${motivoSeleccionado}: ${detalle.trim()}`
        : motivoSeleccionado;
      await crearReporte(usuario.id, tipo, referenciaId, motivo);
      Alert.alert('Reporte enviado', 'Gracias, un administrador revisará tu reporte.');
      cerrar();
    } catch {
      Alert.alert('Error', 'No se pudo enviar el reporte. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={cerrar} statusBarTranslucent>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
        activeOpacity={1}
        onPress={cerrar}
      />
      <View style={{
        backgroundColor: t.surface,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingBottom: insets.bottom + 20,
      }}>
        {/* Handle */}
        <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: t.border }} />
        </View>

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.border }}>
          <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,77,109,0.12)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Ionicons name="flag-outline" size={18} color="#FF4D6D" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: t.text, fontSize: 16, fontWeight: '700' }}>Reportar {TIPO_LABEL[tipo]}</Text>
            <Text style={{ color: t.textMuted, fontSize: 12, marginTop: 1 }}>Selecciona el motivo del reporte</Text>
          </View>
          <TouchableOpacity onPress={cerrar} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={22} color={t.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Motivos */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, gap: 8 }}>
          {MOTIVOS.map((m) => {
            const activo = motivoSeleccionado === m;
            return (
              <TouchableOpacity
                key={m}
                onPress={() => setMotivoSeleccionado(m)}
                activeOpacity={0.75}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: activo ? 'rgba(255,77,109,0.08)' : t.surface2,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: activo ? 'rgba(255,77,109,0.35)' : t.border,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                }}
              >
                <View style={{
                  width: 20, height: 20, borderRadius: 10,
                  borderWidth: 2,
                  borderColor: activo ? '#FF4D6D' : t.border,
                  backgroundColor: activo ? '#FF4D6D' : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {activo && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />}
                </View>
                <Text style={{ color: activo ? '#FF4D6D' : t.textSecondary, fontSize: 14, fontWeight: activo ? '600' : '400' }}>
                  {m}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Detalle opcional */}
        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          <TextInput
            value={detalle}
            onChangeText={setDetalle}
            placeholder="Detalles adicionales (opcional)..."
            placeholderTextColor={t.textMuted}
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: t.surface2,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: t.border,
              paddingHorizontal: 14,
              paddingTop: 10,
              paddingBottom: 10,
              color: t.text,
              fontSize: 13,
              maxHeight: 90,
              textAlignVertical: 'top',
            }}
          />
        </View>

        {/* Botón enviar */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <TouchableOpacity
            onPress={enviar}
            disabled={!motivoSeleccionado || enviando}
            activeOpacity={0.8}
            style={{
              backgroundColor: motivoSeleccionado ? '#FF4D6D' : t.surface2,
              borderRadius: 16,
              paddingVertical: 14,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
            }}
          >
            {enviando ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="flag" size={16} color={motivoSeleccionado ? '#fff' : t.textMuted} />
                <Text style={{ color: motivoSeleccionado ? '#fff' : t.textMuted, fontWeight: '700', fontSize: 14 }}>
                  Enviar reporte
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
