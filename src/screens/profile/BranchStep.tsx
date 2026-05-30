import { useState } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { BRANCHES } from '@/fixtures/constants';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { StepProgress } from '@/components/StepProgress';
import { Title } from '@/components/Title';
import { Body } from '@/components/Body';
import { SelectField } from '@/components/SelectField';
import { Button } from '@/components/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileBranch'>;

export function BranchStep({ navigation }: Props) {
  const [b, setB] = useState('');

  return (
    <Screen footer={
      <Button 
        onPress={() => navigation.navigate('ProfileDone')} 
        disabled={!b}
      >
        Finish
      </Button>
    }>
      <TopBar onBack={navigation.goBack}>
        <StepProgress step={4} total={4} />
      </TopBar>
      <View style={{ paddingTop: 30, flex: 1 }}>
        <Title size={34} style={{ marginBottom: 14 }}>Your branch.</Title>
        <Body style={{ marginBottom: 44 }}>The branch you've been allotted.</Body>
        <SelectField 
          label="Branch" 
          value={b} 
          placeholder="Select your branch" 
          options={BRANCHES} 
          onChange={setB} 
        />
      </View>
    </Screen>
  );
}
