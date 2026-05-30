import { TouchableOpacity, View, Text, ViewStyle } from 'react-native';
import { colors, fonts } from '../tokens';
import { Icon, IconName } from './Icon';

interface Props {
  icon?: IconName;
  title: string;
  subtitle?: string;
  onPress: () => void;
  selected?: boolean;
  emphasis?: boolean;
  titleSize?: number;
  style?: ViewStyle;
}

export function SelectCard({ icon, title, subtitle, onPress, selected = false, emphasis = false, titleSize = 23, style }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[{
        backgroundColor: colors.khadiLight,
        borderWidth: 1,
        borderColor: selected ? colors.ink : colors.hairlineSoft,
        padding: emphasis ? 28 : 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18,
      }, style]}
    >
      {selected && (
        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: colors.ember }} />
      )}
      {icon && <Icon name={icon} size={emphasis ? 30 : 26} color={colors.ink} />}
      <View style={{ flex: 1 }}>
        <Text style={{ 
          fontFamily: fonts.serif, 
          fontSize: titleSize, 
          fontWeight: '400', 
          lineHeight: titleSize * 1.2, 
          color: colors.ink, 
          marginBottom: subtitle ? 7 : 0 
        }}>
          {title}
        </Text>
        {subtitle && (
          <Text style={{ fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: colors.inkMute }}>
            {subtitle}
          </Text>
        )}
      </View>
      <Icon name="chevronRight" size={20} color={selected ? colors.ember : colors.inkWhisper} />
    </TouchableOpacity>
  );
}
