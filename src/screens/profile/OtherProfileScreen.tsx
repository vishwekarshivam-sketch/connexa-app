import { View, Text } from 'react-native';
import { colors, fonts } from '@/tokens';

export function OtherProfileScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: fonts.body, color: colors.inkMute }}>Other Profile — coming soon</Text>
    </View>
  );
}
