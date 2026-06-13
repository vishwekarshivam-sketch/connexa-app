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
  const { user, bootstrapping } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    async function checkState() {
      if (bootstrapping) {
        console.log('[DateScreen] Auth is bootstrapping, waiting...');
        return;
      }

      if (!user) {
        console.log('[DateScreen] No user yet');
        return;
      }

      console.log('[DateScreen] Checking state for user:', {
        id: user.id,
        user_type: user.user_type,
        status: user.status
      });

      // Check if we should show notification prompt (non-freshers only here)
      const asked = await hasAskedForNotifications();
      if (!asked && user.user_type !== 'fresher') {
        setShowPrompt(true);
      }

      const profile = await getDateProfile(user.id);
      console.log('[DateScreen] Fetched profile:', profile);

      // Placeholder for unlock date logic
      const globalUnlockDate = '2026-08-20T00:00:00Z'; 
      const isPreUnlock = user.user_type === 'fresher' && new Date() < new Date(globalUnlockDate);
      
      console.log('[DateScreen] Status check:', { 
        isPreUnlock, 
        profileStatus: profile?.status,
        profileFound: !!profile 
      });

      if (!profile) {
        console.log('[DateScreen] Redirecting to DateIntro (no profile found)');
        if (isPreUnlock) {
          navigation.replace('DateLocked', { unlockDate: globalUnlockDate });
        } else {
          navigation.replace('DateIntro');
        }
        return;
      }

      if (profile.status === 'draft') {
        console.log('[DateScreen] Redirecting to setup/locked (profile in draft)');
        if (isPreUnlock) {
          navigation.replace('DateLocked', { unlockDate: profile.unlock_at || globalUnlockDate });
        } else {
          navigation.replace('DateProfileSetup', { step: 1 });
        }
        return;
      }

      if (profile.status === 'active' || profile.status === 'paused') {
        console.log('[DateScreen] Redirecting to DateFeed (active/paused profile)');
        navigation.replace('DateFeed');
        return;
      }

      console.log('[DateScreen] Fallback to DateIntro');
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
