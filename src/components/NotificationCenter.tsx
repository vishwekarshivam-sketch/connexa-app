import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView,
  Dimensions,
  Pressable
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  useReducedMotion,
  runOnJS
} from 'react-native-reanimated';
import { colors, fonts, duration, ease } from '@/tokens';
import { Icon, IconName } from '@/components/Icon';
import { useUIStore } from '@/stores/uiStore';
import { useNotifications } from '@/hooks/useNotifications';
import { AppNotification, NotificationCategory } from '@/types';
import { useNavigation } from '@react-navigation/native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CATEGORY_ICONS: Record<NotificationCategory, IconName> = {
  daily_prompt: 'bookOpen',
  reaction: 'edit',
  invite_converted: 'users',
  retention_bonus: 'seal',
  mutual_match: 'messageSquare',
  streak_milestone: 'flag',
  house_rank_change: 'shield',
  monthly_reveal: 'bell',
};

export function NotificationCenter() {
  const isOpen = useUIStore((state) => state.notificationSheetOpen);
  const setOpen = useUIStore((state) => state.setNotificationSheetOpen);
  const { data: notifications, markRead, markAllRead } = useNotifications();
  const navigation = useNavigation<any>();
  const reducedMotion = useReducedMotion();

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const scrimOpacity = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      scrimOpacity.value = withTiming(0.4, { duration: duration.standard });
      translateY.value = withTiming(0, { 
        duration: duration.standard, 
        easing: ease.out 
      });
    } else {
      scrimOpacity.value = withTiming(0, { duration: duration.quick });
      translateY.value = withTiming(SCREEN_HEIGHT, { 
        duration: duration.quick, 
        easing: ease.inOut 
      });
    }
  }, [isOpen]);

  const handleClose = () => {
    if (reducedMotion) {
      setOpen(false);
      return;
    }
    scrimOpacity.value = withTiming(0, { duration: duration.quick });
    translateY.value = withTiming(SCREEN_HEIGHT, { 
      duration: duration.quick, 
      easing: ease.inOut 
    }, (finished) => {
      if (finished) {
        runOnJS(setOpen)(false);
      }
    });
  };

  const handlePress = (notification: AppNotification) => {
    markRead.mutate(notification.id);
    handleClose();
    navigation.navigate('Main', {
      screen: 'House',
      params: { screen: 'HouseHome' }
    });
  };

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: scrimOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const renderItem = ({ item }: { item: AppNotification }) => {
    const iconName = CATEGORY_ICONS[item.category] || 'bell';
    
    return (
      <TouchableOpacity 
        style={[styles.row, !item.read && styles.unreadRow]} 
        onPress={() => handlePress(item)}
      >
        <View style={styles.iconContainer}>
          <Icon name={iconName} size={20} color={item.read ? colors.inkWhisper : colors.ink} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.body, !item.read && styles.unreadText]}>
            {item.body}
          </Text>
          <Text style={styles.meta}>
            {item.category.replace('_', ' ')} · {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.scrim, scrimStyle]}>
          <Pressable style={{ flex: 1 }} onPress={handleClose} />
        </Animated.View>
        
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} hitSlop={12}>
                <Icon name="x" size={24} color={colors.ink} />
              </TouchableOpacity>
              <Text style={styles.title}>Notifications</Text>
              <TouchableOpacity onPress={() => markAllRead.mutate()}>
                <Text style={styles.markAll}>Mark all read</Text>
              </TouchableOpacity>
            </View>

            {notifications?.length === 0 ? (
              <View style={styles.empty}>
                <Icon name="bell" size={48} color={colors.inkWhisper} />
                <Text style={styles.emptyText}>Nothing yet.</Text>
                <Text style={styles.emptySubtext}>Notifications will appear here.</Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
              />
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.ink,
  },
  sheet: {
    height: '90%',
    backgroundColor: colors.khadi,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 20,
    color: colors.ink,
  },
  markAll: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.inkWhisper,
    textTransform: 'uppercase',
  },
  list: {
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  unreadRow: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderLeftWidth: 4,
    borderLeftColor: colors.ink,
  },
  iconContainer: {
    marginRight: 16,
    paddingTop: 2,
  },
  content: {
    flex: 1,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    lineHeight: 22,
  },
  unreadText: {
    fontWeight: '600',
  },
  meta: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.inkWhisper,
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontFamily: fonts.title,
    fontSize: 18,
    color: colors.ink,
    marginTop: 16,
  },
  emptySubtext: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.inkWhisper,
    marginTop: 8,
  },
});

