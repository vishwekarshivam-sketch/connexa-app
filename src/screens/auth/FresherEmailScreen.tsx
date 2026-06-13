import { useState } from 'react';
import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { Title } from '@/components/Title';
import { Body } from '@/components/Body';
import { Field } from '@/components/Field';
import { SelectField } from '@/components/SelectField';
import { Button } from '@/components/Button';
import { Eyebrow } from '@/components/Eyebrow';
import { IITS, IIT_DOMAINS } from '@/fixtures/constants';
import { colors, fonts } from '@/tokens';

type Props = NativeStackScreenProps<AuthStackParamList, 'FresherEmail'>;

export function FresherEmailScreen({ navigation }: Props) {
  const [iit, setIit] = useState('');
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');

  const submit = () => {
    const v = email.trim().toLowerCase();
    if (!iit) { setErr('Select your IIT.'); return; }
    if (!v) { setErr('Enter your IIT email.'); return; }
    
    const domain = v.split('@')[1];
    if (!IIT_DOMAINS.includes(domain)) {
      setErr(`Use your official @iit... email.`);
      return;
    }

    navigation.navigate('Otp', { 
      email: v, 
      userType: 'fresher', 
      iit 
    });
  };

  return (
    <Screen footer={<Button onPress={submit} disabled={!iit || !email.trim()}>Send code</Button>}>
      <TopBar onBack={navigation.goBack}>
        <Eyebrow>Verify · 2026 batch</Eyebrow>
      </TopBar>
      <View style={{ paddingTop: 26, marginBottom: 40 }}>
        <Title size={36} style={{ marginBottom: 16 }}>
          {'Verify your\nIIT email.'}
        </Title>
        <Body>A six-digit code goes to your institute address to verify your enrollment.</Body>
      </View>
      
      <View style={{ gap: 24 }}>
        <SelectField
          label="Which IIT are you in?"
          value={iit}
          placeholder="Select IIT"
          options={IITS}
          onChange={(v) => {
            setIit(v);
            if (err) setErr('');
          }}
        />

        <Field
          label="Institute email"
          value={email}
          placeholder="you@iitb.ac.in"
          type="email-address"
          error={err}
          onChange={(v) => {
            setEmail(v);
            if (err) setErr('');
          }}
        />
      </View>

      <Text style={{ 
        marginTop: 32, 
        fontFamily: fonts.body, 
        fontSize: 14, 
        color: colors.inkWhisper,
        lineHeight: 20
      }}>
        {'Don\'t have an IIT email yet? '}
        <Text 
          style={{ color: colors.ink, textDecorationLine: 'underline' }}
          onPress={() => navigation.navigate('DocForm')}
        >
          Verify with documents instead.
        </Text>
      </Text>
    </Screen>
  );
}
