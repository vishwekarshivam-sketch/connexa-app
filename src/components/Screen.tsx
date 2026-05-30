import { View, ScrollView, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../tokens';

interface Props {
  children: React.ReactNode;
  footer?: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  bg?: string;
}

export function Screen({ children, footer, scrollable = false, style, bg = colors.khadi }: Props) {
  const insets = useSafeAreaInsets();
  const Content = scrollable ? ScrollView : View;

  return (
    <View style={{ flex: 1, backgroundColor: bg, paddingTop: insets.top }}>
      <Content 
        style={{ flex: 1 }} 
        contentContainerStyle={scrollable ? { flexGrow: 1 } : undefined}
      >
        <View style={[{ flex: 1, paddingHorizontal: 24 }, style]}>
          {children}
        </View>
      </Content>
      {footer && (
        <View style={{ 
          paddingHorizontal: 24, 
          paddingBottom: Math.max(insets.bottom, 16) + 8, 
          paddingTop: 12 
        }}>
          {footer}
        </View>
      )}
    </View>
  );
}
