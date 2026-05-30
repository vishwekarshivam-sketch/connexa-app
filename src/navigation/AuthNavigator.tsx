import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { SplashScreen } from '@/screens/auth/SplashScreen';
import { UserTypeScreen } from '@/screens/auth/UserTypeScreen';
import { FresherPathScreen } from '@/screens/auth/FresherPathScreen';
import { FresherEmailScreen } from '@/screens/auth/FresherEmailScreen';
import { IitbEmailScreen } from '@/screens/auth/IitbEmailScreen';
import { OtpScreen } from '@/screens/auth/OtpScreen';
import { DocFormScreen } from '@/screens/auth/DocFormScreen';
import { PendingScreen } from '@/screens/auth/PendingScreen';
import { NameStep } from '@/screens/profile/NameStep';
import { PhotoStep } from '@/screens/profile/PhotoStep';
import { GenderStep } from '@/screens/profile/GenderStep';
import { BranchStep } from '@/screens/profile/BranchStep';
import { YearStep } from '@/screens/profile/YearStep';
import { DoneScreen } from '@/screens/profile/DoneScreen';
import { SortingInvitationScreen } from '@/screens/sorting/SortingInvitationScreen';
import { SortingQuizScreen } from '@/screens/sorting/SortingQuizScreen';
import { SortingRevealScreen } from '@/screens/sorting/SortingRevealScreen';
import { SortingCardScreen } from '@/screens/sorting/SortingCardScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="UserType" component={UserTypeScreen} />
      <Stack.Screen name="FresherPath" component={FresherPathScreen} />
      <Stack.Screen name="FresherEmail" component={FresherEmailScreen} />
      <Stack.Screen name="IitbEmail" component={IitbEmailScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="DocForm" component={DocFormScreen} />
      <Stack.Screen name="Pending" component={PendingScreen} />
      <Stack.Screen name="ProfileName" component={NameStep} />
      <Stack.Screen name="ProfilePhoto" component={PhotoStep} />
      <Stack.Screen name="ProfileGender" component={GenderStep} />
      <Stack.Screen name="ProfileBranch" component={BranchStep} />
      <Stack.Screen name="ProfileYear" component={YearStep} />
      <Stack.Screen name="ProfileDone" component={DoneScreen} />
      <Stack.Screen name="SortingInvitation" component={SortingInvitationScreen} />
      <Stack.Screen name="SortingQuiz" component={SortingQuizScreen} />
      <Stack.Screen name="SortingReveal" component={SortingRevealScreen} />
      <Stack.Screen name="SortingCard" component={SortingCardScreen} />
    </Stack.Navigator>
  );
}
