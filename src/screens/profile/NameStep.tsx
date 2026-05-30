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

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileName'>;

export function NameStep({ navigation }: Props) {
  const [name, setName] = useState('');
  const ok = name.trim().length > 0;

  return (
    <Screen footer={
      <Button 
        onPress={() => navigation.navigate('ProfilePhoto')} 
        disabled={!ok}
      >
        Continue
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
          onChange={setName} 
        />
      </View>
    </Screen>
  );
}
