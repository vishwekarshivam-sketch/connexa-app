import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { Screen } from '@/components/Screen';
import { Title } from '@/components/Title';
import { Eyebrow } from '@/components/Eyebrow';
import { SelectCard } from '@/components/SelectCard';
import { View } from 'react-native';

type Props = NativeStackScreenProps<AuthStackParamList, 'UserType'>;

export function UserTypeScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={{ paddingTop: 18 }}>
        <Eyebrow color="#A8421F" style={{ marginBottom: 22 }}>Connexa</Eyebrow>
        <Title size={42} weight="300" style={{ marginBottom: 0 }}>
          {'Who are you\njoining as?'}
        </Title>
      </View>
      <View style={{ flex: 1 }} />
      <View style={{ gap: 14, paddingBottom: 8 }}>
        <SelectCard
          emphasis
          icon="door"
          titleSize={25}
          title="I'm joining the 2026 batch"
          subtitle="Bombay, Kharagpur, Kanpur, Roorkee, Hyderabad, Guwahati, Delhi, or Madras"
          onPress={() => navigation.navigate('FresherPath')}
        />
        <SelectCard
          icon="chairs"
          title="I'm a current IITB student"
          subtitle="Already enrolled at IIT Bombay"
          onPress={() => navigation.navigate('IitbEmail')}
        />
      </View>
    </Screen>
  );
}
