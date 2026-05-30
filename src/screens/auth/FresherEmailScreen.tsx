import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { AuthStackParamList } from '@/types';
import { IIT_DOMAINS } from '@/fixtures/constants';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { Title } from '@/components/Title';
import { Body } from '@/components/Body';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { Eyebrow } from '@/components/Eyebrow';

type Props = NativeStackScreenProps<AuthStackParamList, 'FresherEmail'>;

export function FresherEmailScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const ok = IIT_DOMAINS.some((d) => email.trim().toLowerCase().endsWith('@' + d));

  const submit = () => {
    const v = email.trim().toLowerCase();
    if (!v) { setErr('Enter your institute email.'); return; }
    if (!ok) { 
      setErr("This email domain isn't on our list. Use the document path instead, or check the address."); 
      return; 
    }
    navigation.navigate('Otp', { email: v, next: 'ProfileName' });
  };

  return (
    <Screen footer={<Button onPress={submit} disabled={!ok}>Send code</Button>}>
      <TopBar onBack={navigation.goBack}>
        <Eyebrow>Verify · IIT email</Eyebrow>
      </TopBar>
      <View style={{ paddingTop: 26, marginBottom: 40 }}>
        <Title size={34} style={{ marginBottom: 16 }}>Your institute email.</Title>
        <Body>One of the eight accepted IIT domains. We'll send a six-digit code.</Body>
      </View>
      <Field
        label="Institute email"
        value={email}
        placeholder="you@iitb.ac.in"
        type="email-address"
        autoFocus
        error={err}
        onChange={(v) => { setEmail(v); if (err) setErr(''); }}
      />
    </Screen>
  );
}
