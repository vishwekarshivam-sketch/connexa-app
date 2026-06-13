import { useState, useEffect } from 'react';
import { View, Text, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { colors, fonts } from '@/tokens';
import { Screen } from '@/components/Screen';
import { Eyebrow } from '@/components/Eyebrow';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';
import { getMyVerificationSubmission, VerificationSubmission } from '@/lib/supabase';
import { IITS } from '@/fixtures/constants';

type Props = NativeStackScreenProps<AuthStackParamList, 'Pending'>;

export function PendingScreen({ navigation, route }: Props) {
  const { displayName: pName, iitLabel: pIit, roll: pRoll, email: pEmail } = route.params;
  const { user } = useAuth();
  const [submission, setSubmission] = useState<VerificationSubmission | null>(null);

  useEffect(() => {
    if (user?.status === 'onboarding' || user?.status === 'active') {
      navigation.replace('ProfileName');
    }
  }, [navigation, user?.status]);

  useEffect(() => {
    // Only fetch if we have placeholders (coming from Splash)
    if (pRoll === '...') {
      getMyVerificationSubmission().then(setSubmission);
    }
  }, [pRoll]);

  const displayName = submission?.user?.display_name || pName;
  const iitLabel = submission ? (IITS.find(i => i.value === submission.iit)?.label || submission.iit) : pIit;
  const roll = submission?.roll_number || pRoll;
  const email = pEmail || user?.email || '';

  return (
    <Screen>
      <View style={{ paddingTop: 14 }}>
        <Eyebrow>Connexa · Verification</Eyebrow>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', gap: 30, paddingBottom: 10 }}>
        <View style={{ backgroundColor: colors.lake, padding: 30 }}>
          <Icon name="letter" size={30} color={colors.khadi} />
          <Text style={{ 
            fontFamily: fonts.serif, 
            fontSize: 28, 
            fontWeight: '400', 
            lineHeight: 31, 
            letterSpacing: -0.42, 
            color: colors.khadi, 
            marginTop: 20 
          }}>
            Your verification is under review.
          </Text>
          <Text style={{ 
            fontFamily: fonts.body, 
            fontSize: 15.5, 
            lineHeight: 23, 
            color: 'rgba(239,231,214,0.72)', 
            marginTop: 14 
          }}>
            We'll notify you by email and in-app the moment it's approved. Usually within a few hours.
          </Text>
        </View>

        <View style={{ 
          borderWidth: 1, 
          borderColor: colors.hairlineSoft, 
          backgroundColor: colors.khadiLight 
        }}>
          <Eyebrow style={{ padding: 16, paddingBottom: 12 }}>What you submitted</Eyebrow>
          {[
            ['Institute', iitLabel], 
            ['Name', displayName], 
            ['Roll number', roll],
            ['Email', email ?? user?.email ?? '']
          ].map(([k, v]) => (
            <View key={k} style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'baseline', 
              padding: 13, 
              paddingHorizontal: 18, 
              borderTopWidth: 1, 
              borderTopColor: colors.hairlineSoft, 
              gap: 16 
            }}>
              <Text style={{ 
                fontFamily: fonts.label, 
                fontSize: 10.5, 
                fontWeight: '500', 
                textTransform: 'uppercase', 
                letterSpacing: 1.68, 
                color: colors.inkWhisper 
              }}>{k}</Text>
              <Text style={{ 
                fontFamily: fonts.body, 
                fontSize: 15.5, 
                color: colors.ink, 
                textAlign: 'right', 
                flex: 1 
              }}>{v || '—'}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontFamily: fonts.body, fontSize: 14.5, color: colors.inkMute }}>
          {'Something wrong? '}
          <Text
            style={{ color: colors.ink, textDecorationLine: 'underline' }}
            onPress={() => Linking.openURL('mailto:hello@connexa.app')}
          >
            Contact us
          </Text>
          {'.'}
        </Text>
      </View>
    </Screen>
  );
}
