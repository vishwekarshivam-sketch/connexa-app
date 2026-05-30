import { View, Text } from 'react-native';
import { colors, fonts } from '@/tokens';
export function DocFormScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: colors.ink }}>DocFormScreen</Text>
    </View>
  );
}
