import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { AuthStackParamList } from '@/types';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { Title } from '@/components/Title';
import { Body } from '@/components/Body';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { Eyebrow } from '@/components/Eyebrow';

type Props = NativeStackScreenProps<AuthStackParamList, 'IitbEmail'>;

export function IitbEmailScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const ok = email.trim().toLowerCase().endsWith('@iitb.ac.in');

  // Validate then navigate immediately; the OTP send fires on the next screen's
  // mount so the transition is instant rather than gated on the network call.
  const submit = () => {
    const v = email.trim().toLowerCase();
    if (!v) { setErr('Enter your IITB email.'); return; }
    if (!ok) { setErr('Only @iitb.ac.in emails are accepted here.'); return; }
    navigation.navigate('Otp', { email: v, next: 'ProfileName', userType: 'non_fresher', iit: 'iitb' });
  };

  return (
    <Screen footer={<Button onPress={submit} disabled={!ok}>Send code</Button>}>
      <TopBar onBack={navigation.goBack}>
        <Eyebrow>Verify · IITB</Eyebrow>
      </TopBar>
      <View style={{ paddingTop: 26, marginBottom: 40 }}>
        <Title size={36} style={{ marginBottom: 16 }}>
          {'Verify your\nIITB email.'}
        </Title>
        <Body>A six-digit code goes to your institute address. Nothing else to do.</Body>
      </View>
      <Field
        label="IITB email"
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
