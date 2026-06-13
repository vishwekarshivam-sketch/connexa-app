import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DateStackParamList } from '@/types';
import { colors, fonts } from '@/tokens';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { getDateProfile } from '@/lib/supabase';

type Props = NativeStackScreenProps<DateStackParamList, 'DateIntro'>;

export function DateIntroScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkState() {
      if (!user) return;
      
      try {
        console.log(`[DateIntro] Checking profile for user ${user.id}`);
        const profile = await getDateProfile(user.id);
        console.log(`[DateIntro] Profile check result:`, { 
          found: !!profile, 
          status: profile?.status 
        });
        
        if (profile?.status === 'active' || profile?.status === 'paused') {
          console.log('[DateIntro] Profile active/paused, redirecting to DateFeed');
          navigation.replace('DateFeed');
          return;
        }
      } catch (err) {
        console.error('[DateIntro] Check state error:', err);
      } finally {
        setChecking(false);
      }
    }
    checkState();
  }, [user]);

  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.khadi, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingHorizontal: 32,
          paddingTop: 60,
          paddingBottom: insets.bottom + 40,
          justifyContent: 'center'
        }}
      >
        <Text style={{ 
          fontFamily: fonts.serif, 
          fontSize: 32, 
          color: colors.ink,
          marginBottom: 24
        }}>
          Take your time here.
        </Text>

        <Text style={{ 
          fontFamily: fonts.body, 
          fontSize: 18, 
          lineHeight: 28,
          color: colors.inkMute,
          marginBottom: 60
        }}>
          This is the quiet corner. We show you people you're likely to genuinely click with — not the most-liked, not the loudest. No swiping, no scores.
        </Text>

        <Button 
          onPress={() => navigation.navigate('DateProfileSetup', { step: 1 })}
          style={{ backgroundColor: colors.ink, marginBottom: 16 }}
        >
          Set up my profile
        </Button>

        {user?.is_admin && (
          <TouchableOpacity 
            onPress={async () => {
              const profile = await getDateProfile(user.id);
              alert(`Debug: Profile is ${profile ? 'FOUND' : 'NOT FOUND'}\nUser ID: ${user.id}\nStatus: ${profile?.status || 'N/A'}`);
            }}
            style={{ alignSelf: 'center', padding: 8, marginBottom: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.ember }}
          >
            <Text style={{ fontFamily: fonts.label, fontSize: 10, color: colors.ember }}>DEBUG PROFILE (ADMIN ONLY)</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          onPress={() => navigation.navigate('DateQuestionnaire', { step: 1 })}
          style={{ alignSelf: 'center', padding: 12 }}
        >
          <Text style={{ 
            fontFamily: fonts.label, 
            fontSize: 12, 
            textTransform: 'uppercase', 
            letterSpacing: 1.2,
            color: colors.inkWhisper,
            textAlign: 'center'
          }}>
            Answer questions for better matches
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

