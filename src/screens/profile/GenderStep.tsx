import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList, Gender } from '@/types';
import { colors, fonts } from '@/tokens';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { StepProgress } from '@/components/StepProgress';
import { Title } from '@/components/Title';
import { Body } from '@/components/Body';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileGender'>;
const OPTS: [Gender, string][] = [
  ['male', 'Man'], 
  ['female', 'Woman'], 
  ['other', 'Prefer not to say']
];

export function GenderStep({ navigation }: Props) {
  const { user, updateUser } = useAuth();
  const [g, setG] = useState<Gender | ''>(user?.gender ?? '');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!g) return;
    setSaving(true);
    const { error } = await updateUser({ gender: g });
    setSaving(false);
    if (!error) navigation.navigate('ProfileBranch');
  };

  return (
    <Screen footer={
      <Button 
        onPress={submit} 
        disabled={!g || saving}
      >
        {saving ? 'Saving...' : 'Continue'}
      </Button>
    }>
      <TopBar onBack={navigation.goBack}>
        <StepProgress step={3} total={4} />
      </TopBar>
      <View style={{ paddingTop: 30, flex: 1 }}>
        <Title size={34} style={{ marginBottom: 14 }}>
          {'How do you\nidentify?'}
        </Title>
        <Body style={{ marginBottom: 36 }}>
          Used quietly, for dating filters. Never shown on your profile.
        </Body>
        <View style={{ gap: 12 }}>
          {OPTS.map(([val, label]) => {
            const on = g === val;
            return (
              <TouchableOpacity 
                key={val} 
                onPress={() => setG(val)} 
                activeOpacity={0.85} 
                style={{
                  backgroundColor: colors.khadiLight,
                  borderWidth: 1,
                  borderColor: on ? colors.ink : colors.hairlineSoft,
                  padding: 20,
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
