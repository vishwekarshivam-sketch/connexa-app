import { ConnexaUser } from '@/types';
import { Session } from '@supabase/supabase-js';

export type OnboardingStep = 
  | 'Landing' 
  | 'Pending' 
  | 'ProfileName' 
  | 'ProfilePhoto' 
  | 'ProfileGender' 
  | 'ProfileBranch' 
  | 'ProfileYear' 
  | 'ProfileDone'
  | 'SortingInvitation' 
  | 'Main';

export function getNextOnboardingStep(user: ConnexaUser | null, session: Session | null): OnboardingStep {
  if (!session || !user) return 'Landing';

  // If already has a house, they should go to Main (RootNavigator handles this, 
  // but we return it here for consistency).
  if (user.house) return 'Main';

  // If status is pending, they must wait.
  if (user.status === 'pending') return 'Pending';

  // Profile completion funnel
  if (!user.display_name) return 'ProfileName';
  if (!user.photo_url) return 'ProfilePhoto';
  if (!user.gender) return 'ProfileGender';
  if (!user.branch) return 'ProfileBranch';
  if (!user.year) return 'ProfileYear';

  // Final confirmation screen
  if (user.status === 'onboarding') return 'ProfileDone';

  // Final step before Main
  return 'SortingInvitation';
}
