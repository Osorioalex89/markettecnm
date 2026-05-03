import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  value: number;          // 0-5, acepta decimales para modo display
  size?: number;
  color?: string;
  interactive?: boolean;  // false = solo lectura
  onChange?: (val: number) => void;
  gap?: number;
};

export default function StarRating({
  value,
  size = 16,
  color = '#F59E0B',
  interactive = false,
  onChange,
  gap = 2,
}: Props) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={{ flexDirection: 'row', gap }}>
      {stars.map((star) => {
        const filled = value >= star;
        const half = !filled && value >= star - 0.5;
        const iconName = filled ? 'star' : half ? 'star-half' : 'star-outline';

        if (interactive) {
          return (
            <TouchableOpacity
              key={star}
              onPress={() => onChange?.(star)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Ionicons name={star <= value ? 'star' : 'star-outline'} size={size} color={color} />
            </TouchableOpacity>
          );
        }

        return (
          <Ionicons key={star} name={iconName} size={size} color={color} />
        );
      })}
    </View>
  );
}
