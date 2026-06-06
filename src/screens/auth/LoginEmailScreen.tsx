import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { AuthStackParamList } from '@/types';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { Title } from '@/components/Title';
import { Body } from '@/components/Body';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { Eyebrow } from '@/components/Eyebrow';
import { colors, fonts } from '@/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'LoginEmail'>;

export function LoginEmailScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');

  const submit = () => {
    const v = email.trim().toLowerCase();
    if (!v) { setErr('Enter your email.'); return; }
    
    // Check if it's an IITB email or one of the fresher domains
    // If it is, send OTP
    navigation.navigate('Otp', { 
      email: v, 
      next: 'ProfileName', 
      userType: v.endsWith('@iitb.ac.in') ? 'non_fresher' : 'fresher', 
      iit: v.endsWith('@iitb.ac.in') ? 'iitb' : 'other' // Real logic will rely on verification step
    });
  };

  return (
    <Screen footer={<Button onPress={submit} disabled={!email.trim()}>Send code</Button>}>
      <TopBar onBack={navigation.goBack}>
        <Eyebrow>Log In</Eyebrow>
      </TopBar>
      <View style={{ paddingTop: 26, marginBottom: 40 }}>
        <Title size={36} style={{ marginBottom: 16 }}>
          {'Welcome back.'}
        </Title>
        <Body>Enter the email you used to create your Connexa account. We'll send you a sign-in code.</Body>
      </View>
      <Field
        label="Email address"
        value={email}
        placeholder="you@example.com"
        type="email-address"
        autoFocus
        error={err}
        onChange={(v) => { setEmail(v); if (err) setErr(''); }}
      />
    </Screen>
  );
}
