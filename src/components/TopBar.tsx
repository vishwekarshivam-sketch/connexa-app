import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/tokens';
import { Icon } from '@/components/Icon';
import { useUIStore } from '@/stores/uiStore';
import { useNotifications } from '@/hooks/useNotifications';

interface Props { 
  onBack?: () => void; 
  children?: React.ReactNode;
  showBell?: boolean;
}

export function TopBar({ onBack, children, showBell = true }: Props) {
  const setNotificationSheetOpen = useUIStore((state) => state.setNotificationSheetOpen);
  const { unreadCount } = useNotifications();

  return (
    <View style={styles.container}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} hitSlop={12} style={styles.backButton}>
          <Icon name="chevronLeft" size={24} color={colors.ink} />
        </TouchableOpacity>
      ) : <View style={{ width: 36 }} />}
      
      <View style={{ flex: 1 }}>{children}</View>

      {showBell ? (
        <TouchableOpacity 
          onPress={() => setNotificationSheetOpen(true)} 
          hitSlop={12} 
          style={styles.bellButton}
        >
          <Icon name="bell" size={24} color={colors.ink} />
          {unreadCount > 0 && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      ) : <View style={{ width: 36 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    height: 48, 
    marginTop: 8 
  },
  backButton: { 
    marginRight: 12 
  },
  bellButton: { 
    marginLeft: 12,
    position: 'relative'
  },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.ember,
    borderWidth: 1.5,
    borderColor: colors.khadi,
  }
});
