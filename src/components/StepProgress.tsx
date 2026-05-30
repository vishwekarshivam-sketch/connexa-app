import { View, Text } from 'react-native';
import { colors, fonts } from '@/tokens';

interface Props { 
  step: number; 
  total: number;
}

export function StepProgress({ step, total }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.hairlineSoft }}>
        <View style={{ 
          width: `${(step / total) * 100}%`, 
          height: 1, 
          backgroundColor: colors.ember 
        }} />
      </View>
      <Text style={{ 
        fontFamily: fonts.label, 
        fontSize: 10, 
        color: colors.inkWhisper, 
        letterSpacing: 1.6 
      }}>
        {step}/{total}
      </Text>
    </View>
  );
}
