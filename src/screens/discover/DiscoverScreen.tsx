import { View, Text } from 'react-native';
import { colors, fonts } from '@/tokens';
export function DiscoverScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: colors.ink }}>DiscoverScreen</Text>
    </View>
  );
}
