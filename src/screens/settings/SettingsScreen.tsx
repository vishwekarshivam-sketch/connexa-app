import { View, Text } from 'react-native';
import { colors, fonts } from '@/tokens';

export function SettingsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: fonts.body, color: colors.inkMute }}>Settings — coming soon</Text>
    </View>
  );
}
