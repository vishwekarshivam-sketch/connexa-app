import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { colors, fonts } from '@/tokens';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/Button';
import { registerForPushNotificationsAsync, savePushToken } from '@/lib/notifications';
import { useAuthStore } from '@/stores/authStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function NotificationPrePrompt({ visible, onClose }: Props) {
  const { user } = useAuthStore();

  const handleTurnOn = async () => {
    const reg = await registerForPushNotificationsAsync();
    if (reg && user) {
      await savePushToken(user.id, reg);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.iconCircle}>
            <Icon name="bell" size={32} color={colors.ink} />
          </View>
          
          <Text style={styles.title}>Stay in the loop</Text>
          <Text style={styles.body}>
            Know when your house prompt goes live, when someone reacts to your response, and when a match happens in Date.
          </Text>

          <Button 
            title="Turn on notifications" 
            onPress={handleTurnOn}
            variant="primary"
            style={styles.button}
          />
          
          <TouchableOpacity onPress={onClose} style={styles.ghostButton}>
            <Text style={styles.ghostText}>Not right now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.khadi,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 32,
    alignItems: 'center',
    paddingBottom: 48,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 24,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.inkWhisper,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    width: '100%',
    marginBottom: 12,
  },
  ghostButton: {
    padding: 12,
  },
  ghostText: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.inkWhisper,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
