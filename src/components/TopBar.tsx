import { View, TouchableOpacity } from 'react-native';
import { colors } from '../tokens';
import { Icon } from './Icon';

interface Props { 
  onBack?: () => void; 
  children?: React.ReactNode;
}

export function TopBar({ onBack, children }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 48, marginTop: 8 }}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} hitSlop={12} style={{ marginRight: 12 }}>
          <Icon name="chevronLeft" size={24} color={colors.ink} />
        </TouchableOpacity>
      ) : <View style={{ width: 36 }} />}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
