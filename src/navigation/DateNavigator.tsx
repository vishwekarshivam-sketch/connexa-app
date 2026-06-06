import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DateStackParamList } from '@/types';
import { DateScreen } from '@/screens/date/DateScreen';
import { DateLockedScreen } from '@/screens/date/DateLockedScreen';
import { DateIntroScreen } from '@/screens/date/DateIntroScreen';
import { DateQuestionnaireScreen } from '@/screens/date/DateQuestionnaireScreen';
import { DateProfileSetupScreen } from '@/screens/date/DateProfileSetupScreen';
import { DateFeedScreen } from '@/screens/date/DateFeedScreen';
import { DateFullProfileScreen } from '@/screens/date/DateFullProfileScreen';
import { DateDMScreen } from '@/screens/date/DateDMScreen';
import { DateInterestsScreen } from '@/screens/date/DateInterestsScreen';
import { DateMatchesScreen } from '@/screens/date/DateMatchesScreen';
import { DateSettingsScreen } from '@/screens/date/DateSettingsScreen';

const Stack = createNativeStackNavigator<DateStackParamList>();

export function DateNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="DateHome" component={DateScreen} />
      <Stack.Screen name="DateLocked" component={DateLockedScreen} />
      <Stack.Screen name="DateIntro" component={DateIntroScreen} />
      <Stack.Screen name="DateQuestionnaire" component={DateQuestionnaireScreen} />
      <Stack.Screen name="DateProfileSetup" component={DateProfileSetupScreen} />
      <Stack.Screen name="DateFeed" component={DateFeedScreen} />
      <Stack.Screen name="DateFullProfile" component={DateFullProfileScreen} />
      <Stack.Screen name="DateDM" component={DateDMScreen} />
      <Stack.Screen name="DateInterests" component={DateInterestsScreen} />
      <Stack.Screen name="DateMatches" component={DateMatchesScreen} />
      <Stack.Screen name="DateSettings" component={DateSettingsScreen} />
    </Stack.Navigator>
  );
}
