import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { colors, fonts } from '@/tokens';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { StepProgress } from '@/components/StepProgress';
import { Title } from '@/components/Title';
import { Body } from '@/components/Body';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileYear'>;

const OPTS: [string, string][] = [
  ['2', '2nd year'], 
  ['3', '3rd year'], 
  ['4', '4th year'], 
  ['5', '5th year']
];

export function YearStep({ navigation }: Props) {
  const [y, setY] = useState('');

  return (
    <Screen footer={
      <Button 
        onPress={() => navigation.navigate('ProfileDone')} 
        disabled={!y}
      >
        Finish
      </Button>
    }>
      <TopBar onBack={navigation.goBack}>
        <StepProgress step={5} total={5} />
      </TopBar>
      <View style={{ paddingTop: 30, flex: 1 }}>
        <Title size={34} style={{ marginBottom: 14 }}>Which year?</Title>
        <Body style={{ marginBottom: 36 }}>So we place you with the right cohort.</Body>
        <View style={{ gap: 12 }}>
          {OPTS.map(([val, label]) => {
            const on = y === val;
            return (
              <TouchableOpacity 
                key={val} 
                onPress={() => setY(val)} 
                activeOpacity={0.85} 
                style={{
                  backgroundColor: colors.khadiLight,
                  borderWidth: 1,
                  borderColor: on ? colors.ink : colors.hairlineSoft,
                  padding: 18,
                  paddingHorizontal: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {on && (
                  <View style={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: 0, 
                    bottom: 0, 
                    width: 3, 
                    backgroundColor: colors.ember 
                  }} />
                )}
                <Text style={{ 
                  fontFamily: fonts.serif, 
                  fontSize: 21, 
                  fontWeight: '400', 
                  color: colors.ink 
                }}>
                  {label}
                </Text>
                {on && <Icon name="check" size={20} color={colors.ember} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}
