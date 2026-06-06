import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DateStackParamList } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { getDateProfile } from '@/lib/supabase';
import { colors } from '@/tokens';
import { NotificationPrePrompt } from '@/components/NotificationPrePrompt';
import { hasAskedForNotifications, setNotificationAsked } from '@/lib/notifications';

type Props = NativeStackScreenProps<DateStackParamList, 'DateHome'>;

export function DateScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    async function checkState() {
      if (!user) return;

      // Check if we should show notification prompt (non-freshers only here)
      const asked = await hasAskedForNotifications();
      if (!asked && user.user_type !== 'fresher') {
        setShowPrompt(true);
      }

      const profile = await getDateProfile(user.id);

      // Placeholder for unlock date logic
      const globalUnlockDate = '2026-08-20T00:00:00Z'; 
      const isPreUnlock = user.user_type === 'fresher' && new Date() < new Date(globalUnlockDate);

      if (!profile) {
        if (isPreUnlock) {
          navigation.replace('DateLocked', { unlockDate: globalUnlockDate });
        } else {
          navigation.replace('DateIntro');
        }
        return;
      }

      if (profile.status === 'draft') {
        if (isPreUnlock) {
          navigation.replace('DateLocked', { unlockDate: profile.unlock_at || globalUnlockDate });
        } else {
          // If past unlock or non-fresher, but still draft, send to profile setup
          navigation.replace('DateProfileSetup', { step: 1 });
        }
        return;
      }

      if (profile.status === 'active' || profile.status === 'paused') {
        navigation.replace('DateFeed');
        return;
      }

      navigation.replace('DateIntro');
    }

    checkState();
  }, [user]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.ink} />
      <NotificationPrePrompt 
        visible={showPrompt} 
        onClose={() => {
          setShowPrompt(false);
          setNotificationAsked();
        }} 
      />
    </View>
  );
}
