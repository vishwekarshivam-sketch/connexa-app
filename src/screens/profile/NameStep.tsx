import { useState } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { StepProgress } from '@/components/StepProgress';
import { Title } from '@/components/Title';
import { Body } from '@/components/Body';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileName'>;

export function NameStep({ navigation }: Props) {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.display_name ?? '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const ok = name.trim().length > 0;

  const submit = async () => {
    setSaving(true);
    const { error } = await updateUser({ display_name: name.trim() });
    setSaving(false);
    if (error) {
      setErr(error);
      return;
    }
    navigation.navigate('ProfilePhoto');
  };

  return (
    <Screen footer={
      <Button 
        onPress={submit} 
        disabled={!ok || saving}
      >
        {saving ? 'Saving...' : 'Continue'}
      </Button>
    }>
      <TopBar onBack={navigation.goBack}>
        <StepProgress step={1} total={4} />
      </TopBar>
      <View style={{ paddingTop: 30, flex: 1 }}>
        <Title size={34} style={{ marginBottom: 14 }}>
          {'What should we\ncall you?'}
        </Title>
        <Body style={{ marginBottom: 44 }}>
          The name people will see. You can change it later.
        </Body>
        <Field 
          label="Display name" 
          value={name} 
          placeholder="Your name" 
          autoFocus 
          error={err}
          onChange={(v) => { setName(v); if (err) setErr(''); }} 
        />
      </View>
    </Screen>
  );
}
