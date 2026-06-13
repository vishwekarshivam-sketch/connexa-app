import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { colors, fonts } from '@/tokens';
import { Screen } from '@/components/Screen';
import { Title } from '@/components/Title';
import { Body } from '@/components/Body';
import { Eyebrow } from '@/components/Eyebrow';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileDone'>;

export function DoneScreen({ navigation }: Props) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleBegin = async () => {
    if (user?.status === 'onboarding') {
      setLoading(true);
      const { error } = await updateUser({ status: 'active' });
      setLoading(false);
      if (error) return;
    }
    navigation.navigate('SortingInvitation');
  };

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', gap: 28 }}>
        <Icon name="seal" size={36} color={colors.ink} />
        <View>
          <Eyebrow color={colors.ember} style={{ marginBottom: 20 }}>Verified</Eyebrow>
          <Title size={40} weight="300" style={{ marginBottom: 16 }}>{"You're in."}</Title>
          <Body size={18}>One thing left before your house: a few quiet questions to find where you belong.</Body>
        </View>
        <View style={{ 
          width: '100%', 
          borderTopWidth: 1, 
          borderTopColor: colors.hairlineSoft, 
          paddingTop: 18, 
          flexDirection: 'row', 
          alignItems: 'center', 
          gap: 12 
        }}>
          <Icon name="door" size={22} color={colors.inkMute} />
          <Text style={{ 
            fontFamily: fonts.bodyItalic, 
            fontStyle: 'italic', 
            fontSize: 14.5, 
            color: colors.inkMute 
          }}>
            Next: the Sorting.
          </Text>
        </View>
      </View>
      <View style={{ paddingBottom: 16 }}>
        <Button onPress={handleBegin} disabled={loading}>
          {loading ? 'Finalizing...' : 'Begin the Sorting'}
        </Button>
      </View>
    </Screen>
  );
}
