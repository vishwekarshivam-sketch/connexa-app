import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { colors, fonts } from '@/tokens';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { Title } from '@/components/Title';
import { Body } from '@/components/Body';
import { OtpInput } from '@/components/OtpInput';
import { Button } from '@/components/Button';
import { Eyebrow } from '@/components/Eyebrow';
import { sendOtp, verifyOtp } from '@/lib/supabase';

type Props = NativeStackScreenProps<AuthStackParamList, 'Otp'>;

export function OtpScreen({ navigation, route }: Props) {
  const { email, next, userType, iit } = route.params;
  const [code, setCode] = useState('');
  const [left, setLeft] = useState(60);
  const [err, setErr] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const sentRef = useRef(false);

  // Fire the initial OTP send here (not on the email screen) so the transition
  // into this screen is instant. StrictMode/double-mount guarded by sentRef.
  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;
    sendOtp(email, { userType, iit }).then(({ error }) => {
      if (error) setErr(error);
    });
  }, [email, userType, iit]);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const submit = async () => {
    if (verifying || code.length < 6) return;
    setVerifying(true);
    const { error } = await verifyOtp(email, code, { userType, iit });
    setVerifying(false);
    if (error) {
      setErr(error);
      return;
    }
    navigation.navigate(next);
  };

  const resend = async () => {
    if (resending) return;
    setResending(true);
    const { error } = await sendOtp(email, { userType, iit });
    setResending(false);
    if (error) {
      setErr(error);
      return;
    }
    setCode('');
    setErr('');
    setLeft(60);
  };

  return (
    <Screen footer={<Button onPress={submit} disabled={code.length < 6 || verifying}>{verifying ? 'Verifying...' : 'Verify'}</Button>}>
      <TopBar onBack={navigation.goBack}>
        <Eyebrow>Verify · Code</Eyebrow>
      </TopBar>
      <View style={{ paddingTop: 26, marginBottom: 40 }}>
        <Title size={34} style={{ marginBottom: 16 }}>Enter the code.</Title>
        <Body>
          {'Sent to '}
          <Text style={{ color: colors.ink }}>{email}</Text>
          {'. It expires in ten minutes.'}
        </Body>
      </View>
      <OtpInput value={code} onChange={(v) => { setCode(v); if (err) setErr(''); }} />
      {!!err && (
        <Text style={{ 
          marginTop: 14,
          fontFamily: fonts.body, 
          fontStyle: 'italic', 
          fontSize: 13.5, 
          color: colors.ember 
        }}>
          {err}
        </Text>
      )}
      <View style={{ marginTop: 26 }}>
        {left > 0 ? (
          <Text style={{ 
            fontFamily: fonts.body, 
            fontStyle: 'italic', 
            fontSize: 13.5, 
            color: colors.inkWhisper 
          }}>
            Resend available in {left}s
          </Text>
        ) : (
          <TouchableOpacity onPress={resend} disabled={resending}>
            <Text style={{ 
              fontFamily: fonts.label, 
              fontSize: 11, 
              fontWeight: '500', 
              textTransform: 'uppercase', 
              letterSpacing: 2.56, 
              color: colors.ember 
            }}>
              {resending ? 'Sending...' : 'Resend code'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Screen>
  );
}
