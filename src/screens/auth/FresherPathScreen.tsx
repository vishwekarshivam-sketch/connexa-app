import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { AuthStackParamList } from '@/types';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { Title } from '@/components/Title';
import { Body } from '@/components/Body';
import { SelectCard } from '@/components/SelectCard';
import { Eyebrow } from '@/components/Eyebrow';

type Props = NativeStackScreenProps<AuthStackParamList, 'FresherPath'>;

export function FresherPathScreen({ navigation }: Props) {
  return (
    <Screen>
      <TopBar onBack={navigation.goBack}>
        <Eyebrow>Verify · 2026 batch</Eyebrow>
      </TopBar>
      <View style={{ paddingTop: 26 }}>
        <Title size={34} style={{ marginBottom: 16 }}>
          {"Let's verify you're part of\nthe 2026 batch."}
        </Title>
        <Body>Connexa is only for admitted students. Choose how to verify.</Body>
      </View>
      <View style={{ flex: 1 }} />
      <View style={{ gap: 14, paddingBottom: 8 }}>
        <SelectCard
          icon="letter"
          title="My IIT email has been issued"
          subtitle="Fastest — verify with a code sent to your institute address"
          onPress={() => navigation.navigate('FresherEmail')}
        />
        <SelectCard
          icon="page"
          title="I have my JEE Advanced details"
          subtitle="Roll number and allotment letter — reviewed by hand, usually within hours"
          onPress={() => navigation.navigate('DocForm')}
        />
      </View>
    </Screen>
  );
}
