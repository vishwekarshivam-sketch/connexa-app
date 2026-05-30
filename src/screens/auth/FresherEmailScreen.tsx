import { Linking } from 'react-native';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { FRESHER_FORM_URL } from '@/fixtures/constants';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { Title } from '@/components/Title';
import { Body } from '@/components/Body';
import { Button } from '@/components/Button';
import { Eyebrow } from '@/components/Eyebrow';

type Props = NativeStackScreenProps<AuthStackParamList, 'FresherEmail'>;

export function FresherEmailScreen({ navigation }: Props) {
  return (
    <Screen footer={<Button onPress={() => Linking.openURL(FRESHER_FORM_URL)}>Open form</Button>}>
      <TopBar onBack={navigation.goBack}>
        <Eyebrow>Verify · 2026 batch</Eyebrow>
      </TopBar>
      <View style={{ paddingTop: 26, marginBottom: 40 }}>
        <Title size={36} style={{ marginBottom: 16 }}>
          {'Fill out the\nform to join.'}
        </Title>
        <Body>
          Submit your details in our Google Form. We review every application and send your access link within a few hours.
        </Body>
      </View>
    </Screen>
  );
}
