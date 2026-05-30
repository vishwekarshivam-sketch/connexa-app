import { useState, useEffect } from 'react';
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

type Props = NativeStackScreenProps<AuthStackParamList, 'Otp'>;

export function OtpScreen({ navigation, route }: Props) {
  const { email, next } = route.params;
  const [code, setCode] = useState('');
  const [left, setLeft] = useState(60);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const submit = () => {
    if (code.length === 6) navigation.navigate(next as any);
  };

  return (
    <Screen footer={<Button onPress={submit} disabled={code.length < 6}>Verify</Button>}>
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
      <OtpInput value={code} onChange={setCode} />
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
          <TouchableOpacity onPress={() => setLeft(60)}>
            <Text style={{ 
              fontFamily: fonts.label, 
              fontSize: 11, 
              fontWeight: '500', 
              textTransform: 'uppercase', 
              letterSpacing: 2.56, 
              color: colors.ember 
            }}>
              Resend code
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Screen>
  );
}
