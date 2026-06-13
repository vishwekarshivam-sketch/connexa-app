import { View, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { colors, fonts } from '@/tokens';
import { Screen } from '@/components/Screen';
import { Title } from '@/components/Title';
import { Button } from '@/components/Button';

type Props = NativeStackScreenProps<AuthStackParamList, 'SortingInvitation'>;

export function SortingInvitationScreen({ navigation }: Props) {
  return (
    <Screen bg={colors.ink}>
      <View style={{ 
        flex: 1, 
        justifyContent: 'space-between', 
        paddingTop: 32, 
        paddingBottom: 8 
      }}>
        <View style={{ gap: 6 }}>
          <Text style={{ 
            fontFamily: fonts.label, 
            fontSize: 11, 
            fontWeight: '500', 
            textTransform: 'uppercase', 
            letterSpacing: 2.2, 
            color: colors.khadi 
          }}>
            Connexa
          </Text>
          <Text style={{ 
            fontFamily: fonts.label, 
            fontSize: 11, 
            fontWeight: '500', 
            textTransform: 'uppercase', 
            letterSpacing: 2.2, 
            color: 'rgba(239,231,214,0.5)' 
          }}>
            The Sorting
          </Text>
        </View>
        <View style={{ gap: 20 }}>
          <Title size={32} weight="300" color={colors.khadi}>
            {'Before you go anywhere else —\nyou need to know which house\nyou belong to.'}
          </Title>
          <View style={{ width: '100%', height: 1, backgroundColor: 'rgba(239,231,214,0.2)' }} />
          <Text style={{ 
            fontFamily: fonts.bodyItalic, 
            fontStyle: 'italic', 
            fontSize: 14, 
            color: 'rgba(239,231,214,0.6)' 
          }}>
            Nine questions. No right answers. The Sorting is final. You get one.
          </Text>
        </View>
        <View style={{ gap: 16 }}>
          <Button
            onPress={() => navigation.navigate('SortingQuiz')}
            style={{ backgroundColor: colors.ember, borderWidth: 0 }}
          >
            Begin
          </Button>
          <Text style={{ 
            fontFamily: fonts.bodyItalic, 
            fontStyle: 'italic', 
            fontSize: 13, 
            color: 'rgba(239,231,214,0.4)', 
            textAlign: 'center' 
          }}>
            The Sorting is final. You get one.
          </Text>
        </View>
      </View>
    </Screen>
  );
}
