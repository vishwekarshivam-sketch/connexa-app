# Backend & Supabase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 4 auth/routing bugs, add Supabase tables for house scores and introductions, and wire all 4 main-tab screens to live Supabase data.

**Architecture:** Single new migration adds `house_scores` + `introductions` tables + new RLS policy allowing housemates to see each other. New query functions added to `src/lib/supabase.ts`. Each main screen swaps fixture data for real Supabase calls. No new files beyond the migration — everything added to existing modules.

**Tech Stack:** Expo 56 / React Native 0.85, @supabase/supabase-js ^2, TypeScript 6, NativeWind/Tailwind, React Navigation 7.

---

## File Map

| File | Action | What changes |
|------|--------|--------------|
| `src/fixtures/constants.ts` | Modify | Add `FRESHER_FORM_URL` constant |
| `src/types/index.ts` | Modify | Fix `UserType` enum (`'fresher' \| 'student_25b' \| 'student_other'`) |
| `src/lib/supabase.ts` | Modify | Add `HouseScore`, `IntroductionWithProfile` types; add `getHouseMembers`, `getHouseScores`, `getMyIntroductions`, `respondToIntroduction` functions |
| `src/screens/auth/FresherEmailScreen.tsx` | Modify | Replace OTP flow with Google Form link button |
| `src/navigation/RootNavigator.tsx` | Modify | Handle verified-no-house routing gap |
| `src/screens/sorting/SortingCardScreen.tsx` | Modify | Add error state to `completeSorting` call |
| `src/screens/house/HouseHomeScreen.tsx` | Modify | Use `useAuth` + `getHouseMembers` instead of `MOCK_HOUSE` |
| `src/screens/discover/DiscoverScreen.tsx` | Modify | Use `getHouseMembers` instead of `DISCOVER_PROFILES` fixture |
| `src/screens/leaderboard/LeaderboardScreen.tsx` | Modify | Use `getHouseScores` instead of `MOCK_STANDINGS` |
| `src/screens/introductions/IntroductionsScreen.tsx` | Modify | Use `getMyIntroductions` + `respondToIntroduction` instead of fixture |
| `supabase/migrations/20260530000001_connexa_main_features.sql` | Create | `house_scores`, `introductions` tables, new RLS policy |

---

## Task 1: Fix UserType enum mismatch

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Update the enum**

In `src/types/index.ts` line 1, change:
```ts
export type UserType = 'fresher' | 'iitb';
```
to:
```ts
export type UserType = 'fresher' | 'student_25b' | 'student_other';
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app && npx tsc --noEmit 2>&1 | head -40
```

Expected: zero errors (or only pre-existing unrelated errors — note any new ones and fix them before committing).

- [ ] **Step 3: Commit**

```bash
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app add src/types/index.ts
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app commit -m "fix: correct UserType enum to match supabase (student_25b, student_other)"
```

---

## Task 2: Fix FresherEmailScreen → Google Form redirect

**Files:**
- Modify: `src/fixtures/constants.ts`
- Modify: `src/screens/auth/FresherEmailScreen.tsx`

- [ ] **Step 1: Add FRESHER_FORM_URL constant**

In `src/fixtures/constants.ts`, append at the bottom:

```ts
export const FRESHER_FORM_URL = 'https://forms.gle/REPLACE_WITH_REAL_URL';
```

(Replace value with the real Google Form URL before going live.)

- [ ] **Step 2: Rewrite FresherEmailScreen**

Replace entire content of `src/screens/auth/FresherEmailScreen.tsx` with:

```tsx
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
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app && npx tsc --noEmit 2>&1 | head -40
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app add src/fixtures/constants.ts src/screens/auth/FresherEmailScreen.tsx
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app commit -m "fix: replace FresherEmail OTP flow with Google Form redirect"
```

---

## Task 3: Fix RootNavigator verified-but-no-house routing

**Files:**
- Modify: `src/navigation/RootNavigator.tsx`
- Modify: `src/context/AuthContext.tsx`

- [ ] **Step 1: Add isVerified export and isSorting-ready derived value**

`AuthContext.tsx` already exposes `isVerified`. Confirm line 94:
```ts
isVerified: user?.verification_status === 'verified',
```
This is correct — no change needed here.

- [ ] **Step 2: Update RootNavigator routing logic**

Replace entire content of `src/navigation/RootNavigator.tsx` with:

```tsx
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from '@/navigation/AuthNavigator';
import { MainNavigator } from '@/navigation/MainNavigator';
import { useAuth } from '@/context/AuthContext';
import { View } from 'react-native';

export function RootNavigator() {
  const { bootstrapping, session, user } = useAuth();

  if (bootstrapping) {
    return <View style={{ flex: 1 }} />;
  }

  const verifiedWithHouse =
    !!session &&
    user?.verification_status === 'verified' &&
    !!user.house;

  return (
    <NavigationContainer>
      {verifiedWithHouse ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
```

The `AuthNavigator` already includes `SortingInvitation → SortingQuiz → SortingReveal → SortingCard` screens. A user who is verified but has no house will be served by `AuthNavigator` and, once they return to the app, `PendingScreen`'s `useEffect` handles redirecting to `ProfileName` on approval. The sorting screens at the end of `AuthNavigator` handle the house assignment. When `completeSorting` writes `house` to the DB, the `onAuthStateChange` listener in `AuthContext` triggers `refreshUser()`, which updates `user.house`, which flips `verifiedWithHouse` to `true` and swaps to `MainNavigator`.

- [ ] **Step 3: Verify TypeScript**

```bash
cd /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app && npx tsc --noEmit 2>&1 | head -40
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app add src/navigation/RootNavigator.tsx
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app commit -m "fix: route verified-no-house users to sorting via AuthNavigator"
```

---

## Task 4: Fix SortingCardScreen silent error

**Files:**
- Modify: `src/screens/sorting/SortingCardScreen.tsx`

- [ ] **Step 1: Add error state and display**

Replace entire content of `src/screens/sorting/SortingCardScreen.tsx` with:

```tsx
import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { HOUSES } from '@/fixtures/houseData';
import { colors, fonts } from '@/tokens';
import { Mark } from '@/components/Mark';
import { useAuth } from '@/context/AuthContext';
import { completeSorting } from '@/lib/supabase';

type Props = NativeStackScreenProps<AuthStackParamList, 'SortingCard'>;

export function SortingCardScreen({ navigation, route }: Props) {
  const house = HOUSES[route.params.house];
  const { setUser } = useAuth();
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const enter = async () => {
    setLoading(true);
    const result = await completeSorting(route.params.house);
    setLoading(false);
    if (result.error) {
      setErr(result.error);
      return;
    }
    if (result.user) setUser(result.user);
  };

  return (
    <View style={{
      flex: 1,
      backgroundColor: house.primary,
      padding: 32,
      justifyContent: 'space-between',
    }}>
      <View style={{ alignItems: 'flex-start', gap: 12 }}>
        <Mark width={80} color="rgba(239,231,214,0.4)" />
        <Text style={{
          fontFamily: fonts.label,
          fontSize: 10.5,
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: 1.68,
          color: 'rgba(239,231,214,0.6)',
          marginTop: 8,
        }}>
          House membership
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{
          fontFamily: fonts.serif,
          fontSize: 42,
          fontWeight: '300',
          color: colors.khadi,
          lineHeight: 46,
        }}>
          {house.nameEn}
        </Text>
        <Text style={{
          fontFamily: fonts.serif,
          fontSize: 22,
          color: 'rgba(239,231,214,0.5)',
        }}>
          {house.nameHi}
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {!!err && (
          <Text style={{
            fontFamily: fonts.body,
            fontStyle: 'italic',
            fontSize: 13.5,
            color: 'rgba(239,231,214,0.7)',
          }}>
            {err}
          </Text>
        )}
        <TouchableOpacity
          onPress={enter}
          disabled={loading}
          style={{
            borderWidth: 1,
            borderColor: 'rgba(239,231,214,0.4)',
            padding: 18,
            alignItems: 'center',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <Text style={{
            fontFamily: fonts.label,
            fontSize: 11,
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: 2.2,
            color: colors.khadi,
          }}>
            {loading ? 'Entering...' : 'Enter Connexa'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app && npx tsc --noEmit 2>&1 | head -40
```

- [ ] **Step 3: Commit**

```bash
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app add src/screens/sorting/SortingCardScreen.tsx
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app commit -m "fix: show error and loading state in SortingCardScreen completeSorting"
```

---

## Task 5: Write second Supabase migration

**Files:**
- Create: `supabase/migrations/20260530000001_connexa_main_features.sql`

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/20260530000001_connexa_main_features.sql` with this exact content:

```sql
-- house_scores: one row per house per week, scores managed by admin/functions only
create table if not exists public.house_scores (
  id uuid primary key default gen_random_uuid(),
  house public.connexa_house not null,
  week_start date not null,
  score integer not null default 0,
  created_at timestamptz not null default now(),
  unique (house, week_start)
);

alter table public.house_scores enable row level security;

revoke all on table public.house_scores from anon, authenticated;
grant select on table public.house_scores to authenticated;

drop policy if exists "authenticated users can read house scores" on public.house_scores;
create policy "authenticated users can read house scores"
on public.house_scores for select
using (auth.uid() is not null);

-- Seed current week with zero scores for all four houses
insert into public.house_scores (house, week_start, score)
values
  ('tinkerers',  date_trunc('week', current_date)::date, 0),
  ('wanderers',  date_trunc('week', current_date)::date, 0),
  ('strategists',date_trunc('week', current_date)::date, 0),
  ('mavericks',  date_trunc('week', current_date)::date, 0)
on conflict (house, week_start) do nothing;

-- introductions: pending intro requests between users, inserted by admin/matching logic
create table if not exists public.introductions (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.users(id) on delete cascade,
  to_user uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'passed')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (from_user, to_user)
);

alter table public.introductions enable row level security;

revoke all on table public.introductions from anon, authenticated;
grant select on table public.introductions to authenticated;
grant update (status, responded_at) on table public.introductions to authenticated;

drop policy if exists "users can read their own introductions" on public.introductions;
create policy "users can read their own introductions"
on public.introductions for select
using (from_user = auth.uid() or to_user = auth.uid());

drop policy if exists "recipients can respond to introductions" on public.introductions;
create policy "recipients can respond to introductions"
on public.introductions for update
using (to_user = auth.uid())
with check (to_user = auth.uid());

-- Allow verified housemates to see each other's profiles
-- (existing policy only allowed own row or admin)
drop policy if exists "verified housemates can see each other" on public.users;
create policy "verified housemates can see each other"
on public.users for select
using (
  verification_status = 'verified'
  and house is not null
  and house = (
    select house from public.users where id = auth.uid()
  )
);
```

- [ ] **Step 2: Verify file exists**

```bash
ls -la /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app/supabase/migrations/
```

Expected: both `20260530000000_connexa_auth_backend.sql` and `20260530000001_connexa_main_features.sql` listed.

- [ ] **Step 3: Commit**

```bash
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app add supabase/migrations/20260530000001_connexa_main_features.sql
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app commit -m "feat: add house_scores, introductions tables and housemate RLS policy"
```

---

## Task 6: Add new types and query functions to supabase.ts

**Files:**
- Modify: `src/lib/supabase.ts`

- [ ] **Step 1: Add HouseScore and IntroductionWithProfile types**

After the `AuthResult` interface (after line 43 in current file), add:

```ts
export interface HouseScore {
  id: string;
  house: House;
  week_start: string;
  score: number;
}

export interface IntroductionWithProfile {
  id: string;
  from_user: string;
  status: 'pending' | 'accepted' | 'passed';
  created_at: string;
  responded_at: string | null;
  display_name: string | null;
  photo_url: string | null;
  iit: string | null;
  branch: string | null;
  house: House | null;
}
```

Note: `House` is imported from `@/types` — confirm the import at line 6 already reads:
```ts
import { House } from '@/types';
```
It does — no change needed.

- [ ] **Step 2: Add getHouseMembers function**

Append after the `completeSorting` function (end of file):

```ts
export async function getHouseMembers(house: House): Promise<ConnexaUser[]> {
  try {
    const client = requireSupabase();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) return [];

    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('house', house)
      .eq('verification_status', 'verified')
      .neq('id', authData.user.id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data ?? []) as ConnexaUser[];
  } catch {
    return [];
  }
}
```

- [ ] **Step 3: Add getHouseScores function**

```ts
export async function getHouseScores(): Promise<HouseScore[]> {
  try {
    const client = requireSupabase();
    const { data, error } = await client
      .from('house_scores')
      .select('*')
      .order('score', { ascending: false });
    if (error) throw error;
    return (data ?? []) as HouseScore[];
  } catch {
    return [];
  }
}
```

- [ ] **Step 4: Add getMyIntroductions function**

```ts
export async function getMyIntroductions(): Promise<IntroductionWithProfile[]> {
  try {
    const client = requireSupabase();
    const { data: authData, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) return [];

    const { data, error } = await client
      .from('introductions')
      .select(`
        id,
        from_user,
        status,
        created_at,
        responded_at,
        users!introductions_from_user_fkey (
          display_name,
          photo_url,
          iit,
          branch,
          house
        )
      `)
      .eq('to_user', authData.user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;

    return ((data ?? []) as any[]).map((row) => ({
      id: row.id,
      from_user: row.from_user,
      status: row.status,
      created_at: row.created_at,
      responded_at: row.responded_at,
      display_name: row.users?.display_name ?? null,
      photo_url: row.users?.photo_url ?? null,
      iit: row.users?.iit ?? null,
      branch: row.users?.branch ?? null,
      house: row.users?.house ?? null,
    }));
  } catch {
    return [];
  }
}
```

- [ ] **Step 5: Add respondToIntroduction function**

```ts
export async function respondToIntroduction(
  id: string,
  response: 'accepted' | 'passed',
): Promise<{ error: string | null }> {
  try {
    const client = requireSupabase();
    const { error } = await client
      .from('introductions')
      .update({ status: response, responded_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return { error: error.message };
    return { error: null };
  } catch (error) {
    return { error: messageFromError(error) };
  }
}
```

- [ ] **Step 6: Verify TypeScript**

```bash
cd /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app && npx tsc --noEmit 2>&1 | head -40
```

Expected: no new errors.

- [ ] **Step 7: Commit**

```bash
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app add src/lib/supabase.ts
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app commit -m "feat: add HouseScore/IntroductionWithProfile types and query functions to supabase.ts"
```

---

## Task 7: Wire HouseHomeScreen to live data

**Files:**
- Modify: `src/screens/house/HouseHomeScreen.tsx`

- [ ] **Step 1: Replace HouseHomeScreen with live-data version**

Replace entire content of `src/screens/house/HouseHomeScreen.tsx` with:

```tsx
import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/tokens';
import { HOUSES } from '@/fixtures/houseData';
import { Mark } from '@/components/Mark';
import { useAuth } from '@/context/AuthContext';
import { getHouseMembers, ConnexaUser } from '@/lib/supabase';

export function HouseHomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [members, setMembers] = useState<ConnexaUser[]>([]);

  const houseKey = user?.house ?? 'tinkerers';
  const house = HOUSES[houseKey];

  useEffect(() => {
    if (!user?.house) return;
    getHouseMembers(user.house).then(setMembers);
  }, [user?.house]);

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const activeCount = members.filter((m) => m.updated_at > oneDayAgo).length;

  const tiles = [
    { label: 'Members', value: String(members.length + 1), sub: 'in your house' },
    { label: 'Active today', value: String(activeCount), sub: 'online now' },
    { label: 'House Lore', value: house.ethos, isText: true },
    { label: 'First Signal', value: '—', sub: 'coming soon' },
    { label: 'This week', value: '—' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: house.primary, paddingTop: insets.top }}>
      <View style={{
        padding: 24,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <View>
          <Text style={{
            fontFamily: fonts.label,
            fontSize: 10.5,
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: 1.68,
            color: 'rgba(239,231,214,0.75)',
            marginBottom: 4,
          }}>
            Your House
          </Text>
          <Text style={{
            fontFamily: fonts.serif,
            fontSize: 36,
            fontWeight: '300',
            color: colors.khadi,
            lineHeight: 40,
          }}>
            {house.nameEn}
          </Text>
        </View>
        <Mark width={48} color="rgba(239,231,214,0.3)" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {tiles.slice(0, 2).map((tile) => (
            <TouchableOpacity
              key={tile.label}
              activeOpacity={0.85}
              style={{
                flex: 1,
                backgroundColor: 'rgba(239,231,214,0.08)',
                borderWidth: 1,
                borderColor: 'rgba(239,231,214,0.12)',
                padding: 20,
                gap: 4,
              }}
            >
              <Text style={{
                fontFamily: fonts.label,
                fontSize: 10.5,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: 1.68,
                color: 'rgba(239,231,214,0.5)',
              }}>
                {tile.label}
              </Text>
              <Text style={{
                fontFamily: fonts.serif,
                fontSize: 36,
                fontWeight: '300',
                color: colors.khadi,
              }}>
                {tile.value}
              </Text>
              {tile.sub && (
                <Text style={{
                  fontFamily: fonts.body,
                  fontSize: 13,
                  color: 'rgba(239,231,214,0.5)',
                }}>
                  {tile.sub}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={{
            backgroundColor: 'rgba(239,231,214,0.06)',
            borderWidth: 1,
            borderColor: 'rgba(239,231,214,0.12)',
            padding: 20,
          }}
        >
          <Text style={{
            fontFamily: fonts.label,
            fontSize: 10.5,
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: 1.68,
            color: 'rgba(239,231,214,0.5)',
            marginBottom: 12,
          }}>
            House Lore
          </Text>
          <Text style={{
            fontFamily: fonts.body,
            fontStyle: 'italic',
            fontSize: 16,
            color: 'rgba(239,231,214,0.75)',
            lineHeight: 24,
          }}>
            {house.ethos}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          {tiles.slice(3).map((tile) => (
            <TouchableOpacity
              key={tile.label}
              activeOpacity={0.85}
              style={{
                flex: 1,
                backgroundColor: 'rgba(239,231,214,0.08)',
                borderWidth: 1,
                borderColor: 'rgba(239,231,214,0.12)',
                padding: 20,
                gap: 4,
              }}
            >
              <Text style={{
                fontFamily: fonts.label,
                fontSize: 10.5,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: 1.68,
                color: 'rgba(239,231,214,0.5)',
              }}>
                {tile.label}
              </Text>
              <Text style={{
                fontFamily: fonts.serif,
                fontSize: 28,
                fontWeight: '300',
                color: colors.khadi,
                lineHeight: 32,
              }}>
                {tile.value}
              </Text>
              {tile.sub && (
                <Text style={{
                  fontFamily: fonts.body,
                  fontSize: 13,
                  color: 'rgba(239,231,214,0.5)',
                }}>
                  {tile.sub}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
```

Note: `ConnexaUser` from `supabase.ts` has `updated_at` field added by the migration (`updated_at timestamptz`). TypeScript will infer it from the `*` select. If TS complains, add `updated_at: string;` to the `ConnexaUser` interface in `supabase.ts`.

- [ ] **Step 2: Add updated_at to ConnexaUser interface if missing**

In `src/lib/supabase.ts`, check the `ConnexaUser` interface. The `users` table has `updated_at timestamptz not null`. If `updated_at` is not in the interface, add it after `created_at`:

```ts
updated_at: string;
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app && npx tsc --noEmit 2>&1 | head -40
```

- [ ] **Step 4: Commit**

```bash
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app add src/screens/house/HouseHomeScreen.tsx src/lib/supabase.ts
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app commit -m "feat: wire HouseHomeScreen to live Supabase data"
```

---

## Task 8: Wire DiscoverScreen to live data

**Files:**
- Modify: `src/screens/discover/DiscoverScreen.tsx`

- [ ] **Step 1: Replace DiscoverScreen with live-data version**

Replace entire content of `src/screens/discover/DiscoverScreen.tsx` with:

```tsx
import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/tokens';
import { Eyebrow } from '@/components/Eyebrow';
import { useAuth } from '@/context/AuthContext';
import { getHouseMembers, ConnexaUser } from '@/lib/supabase';

type Filter = 'All' | 'Your IIT' | 'Cross-IIT' | 'By Branch';
const FILTERS: Filter[] = ['All', 'Your IIT', 'Cross-IIT', 'By Branch'];

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [members, setMembers] = useState<ConnexaUser[]>([]);
  const [filter, setFilter] = useState<Filter>('All');

  useEffect(() => {
    if (!user?.house) return;
    getHouseMembers(user.house).then(setMembers);
  }, [user?.house]);

  const filtered = members.filter((m) => {
    if (filter === 'All') return true;
    if (filter === 'Your IIT') return m.iit === user?.iit;
    if (filter === 'Cross-IIT') return m.iit !== user?.iit;
    return true;
  });

  const sorted =
    filter === 'By Branch'
      ? [...filtered].sort((a, b) => (a.branch ?? '').localeCompare(b.branch ?? ''))
      : filtered;

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      <View style={{
        padding: 24,
        paddingBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Text style={{
          fontFamily: fonts.serif,
          fontSize: 28,
          fontWeight: '400',
          color: colors.ink,
        }}>
          House-mates
        </Text>
        <Text style={{
          fontFamily: fonts.label,
          fontSize: 10.5,
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: 1.68,
          color: colors.inkWhisper,
        }}>
          {members.length}
        </Text>
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingBottom: 16 }}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              activeOpacity={0.85}
              onPress={() => setFilter(f)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                backgroundColor: filter === f ? colors.ink : 'transparent',
                borderWidth: 1,
                borderColor: filter === f ? colors.ink : colors.hairline,
              }}
            >
              <Text style={{
                fontFamily: fonts.label,
                fontSize: 10,
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: 1.6,
                color: filter === f ? colors.khadi : colors.inkMute,
              }}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24 }}>
        <Eyebrow style={{ marginBottom: 16 }}>Recently joined</Eyebrow>
        {sorted.map((m) => (
          <TouchableOpacity
            key={m.id}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              paddingVertical: 18,
              borderBottomWidth: 1,
              borderBottomColor: colors.hairlineSoft,
            }}
          >
            <View style={{
              width: 48,
              height: 48,
              backgroundColor: colors.lake,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {m.photo_url ? (
                <Image
                  source={{ uri: m.photo_url }}
                  style={{ width: 48, height: 48 }}
                />
              ) : (
                <Text style={{
                  fontFamily: fonts.label,
                  fontSize: 14,
                  fontWeight: '500',
                  color: colors.khadi,
                }}>
                  {(m.display_name ?? '?').slice(0, 2).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontFamily: fonts.serif,
                fontSize: 18,
                color: colors.ink,
                marginBottom: 2,
              }}>
                {m.display_name ?? 'Anonymous'}
              </Text>
              <Text style={{
                fontFamily: fonts.body,
                fontSize: 13,
                color: colors.inkMute,
              }} numberOfLines={1}>
                {[m.iit, m.branch].filter(Boolean).join(' · ')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        {sorted.length === 0 && (
          <Text style={{
            fontFamily: fonts.body,
            fontStyle: 'italic',
            fontSize: 15,
            color: colors.inkWhisper,
            marginTop: 32,
          }}>
            No house-mates yet.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app && npx tsc --noEmit 2>&1 | head -40
```

- [ ] **Step 3: Commit**

```bash
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app add src/screens/discover/DiscoverScreen.tsx
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app commit -m "feat: wire DiscoverScreen to live Supabase house members"
```

---

## Task 9: Wire LeaderboardScreen to live data

**Files:**
- Modify: `src/screens/leaderboard/LeaderboardScreen.tsx`

- [ ] **Step 1: Replace LeaderboardScreen with live-data version**

Replace entire content of `src/screens/leaderboard/LeaderboardScreen.tsx` with:

```tsx
import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/tokens';
import { HOUSES } from '@/fixtures/houseData';
import { getHouseScores, HouseScore } from '@/lib/supabase';

function weekLabel(weekStart: string): string {
  const d = new Date(weekStart);
  return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const [scores, setScores] = useState<HouseScore[]>([]);

  useEffect(() => {
    getHouseScores().then(setScores);
  }, []);

  const label = scores[0] ? `Week of ${weekLabel(scores[0].week_start)}` : 'This week';

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      <View style={{ padding: 24, paddingBottom: 20 }}>
        <Text style={{ fontFamily: fonts.serif, fontSize: 28, color: colors.ink }}>
          Leaderboard
        </Text>
        <Text style={{
          fontFamily: fonts.body,
          fontStyle: 'italic',
          fontSize: 14,
          color: colors.inkMute,
          marginTop: 4,
        }}>
          House standings · {label}
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}>
        {scores.map((s, i) => {
          const house = HOUSES[s.house];
          return (
            <View
              key={s.house}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                paddingVertical: 18,
                borderBottomWidth: 1,
                borderBottomColor: colors.hairlineSoft,
              }}
            >
              <Text style={{
                fontFamily: fonts.serif,
                fontSize: 28,
                fontWeight: '300',
                color: colors.inkWhisper,
                width: 32,
              }}>
                {i + 1}
              </Text>
              <View style={{ width: 4, height: 40, backgroundColor: house.primary }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.serif, fontSize: 20, color: colors.ink }}>
                  {house.nameEn}
                </Text>
              </View>
              <Text style={{
                fontFamily: fonts.serif,
                fontSize: 24,
                fontWeight: '300',
                color: colors.ink,
              }}>
                {s.score.toLocaleString()}
              </Text>
            </View>
          );
        })}
        {scores.length === 0 && (
          <Text style={{
            fontFamily: fonts.body,
            fontStyle: 'italic',
            fontSize: 15,
            color: colors.inkWhisper,
            marginTop: 32,
          }}>
            Scores loading…
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app && npx tsc --noEmit 2>&1 | head -40
```

- [ ] **Step 3: Commit**

```bash
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app add src/screens/leaderboard/LeaderboardScreen.tsx
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app commit -m "feat: wire LeaderboardScreen to live Supabase house scores"
```

---

## Task 10: Wire IntroductionsScreen to live data

**Files:**
- Modify: `src/screens/introductions/IntroductionsScreen.tsx`

- [ ] **Step 1: Replace IntroductionsScreen with live-data version**

Replace entire content of `src/screens/introductions/IntroductionsScreen.tsx` with:

```tsx
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/tokens';
import { getMyIntroductions, respondToIntroduction, IntroductionWithProfile } from '@/lib/supabase';

export function IntroductionsScreen() {
  const insets = useSafeAreaInsets();
  const [intros, setIntros] = useState<IntroductionWithProfile[]>([]);

  useEffect(() => {
    getMyIntroductions().then(setIntros);
  }, []);

  const respond = async (id: string, response: 'accepted' | 'passed') => {
    setIntros((prev) => prev.filter((i) => i.id !== id));
    await respondToIntroduction(id, response);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      <View style={{ padding: 24, paddingBottom: 12 }}>
        <Text style={{ fontFamily: fonts.serif, fontSize: 28, color: colors.ink }}>
          Introductions
        </Text>
        <Text style={{
          fontFamily: fonts.body,
          fontStyle: 'italic',
          fontSize: 14,
          color: colors.inkMute,
          marginTop: 4,
        }}>
          People who want to meet you.
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
        {intros.map((p) => (
          <View
            key={p.id}
            style={{
              backgroundColor: colors.khadiLight,
              borderWidth: 1,
              borderColor: colors.hairlineSoft,
              padding: 20,
              gap: 12,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{
                width: 40,
                height: 40,
                backgroundColor: colors.lichen,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {p.photo_url ? (
                  <Image source={{ uri: p.photo_url }} style={{ width: 40, height: 40 }} />
                ) : (
                  <Text style={{ fontFamily: fonts.label, fontSize: 12, color: colors.khadi }}>
                    {(p.display_name ?? '?').slice(0, 2).toUpperCase()}
                  </Text>
                )}
              </View>
              <View>
                <Text style={{ fontFamily: fonts.serif, fontSize: 18, color: colors.ink }}>
                  {p.display_name ?? 'Anonymous'}
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkMute }}>
                  {[p.iit, p.branch].filter(Boolean).join(' · ')}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => respond(p.id, 'accepted')}
                style={{
                  flex: 1,
                  height: 44,
                  backgroundColor: colors.ink,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{
                  fontFamily: fonts.label,
                  fontSize: 10,
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  color: colors.khadi,
                }}>
                  Respond
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => respond(p.id, 'passed')}
                style={{
                  height: 44,
                  paddingHorizontal: 20,
                  borderWidth: 1,
                  borderColor: colors.hairline,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{
                  fontFamily: fonts.label,
                  fontSize: 10,
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  color: colors.inkMute,
                }}>
                  Pass
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {intros.length === 0 && (
          <Text style={{
            fontFamily: fonts.body,
            fontStyle: 'italic',
            fontSize: 15,
            color: colors.inkWhisper,
            marginTop: 32,
          }}>
            No introductions yet.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app && npx tsc --noEmit 2>&1 | head -40
```

- [ ] **Step 3: Commit**

```bash
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app add src/screens/introductions/IntroductionsScreen.tsx
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app commit -m "feat: wire IntroductionsScreen to live Supabase introductions"
```

---

## Task 11: Supabase project setup checklist

This task is manual — no code changes. Complete before testing.

- [ ] **Step 1: Create Supabase project**

Go to https://supabase.com → New project. Note the Project URL and anon key.

- [ ] **Step 2: Enable Anonymous sign-ins**

Dashboard → Authentication → Providers → Anonymous → toggle ON.

- [ ] **Step 3: Enable Email OTP**

Dashboard → Authentication → Providers → Email → toggle ON "Enable Email OTP". Disable "Confirm email" / magic link if they appear (keep only OTP).

- [ ] **Step 4: Run migrations**

In Dashboard → SQL Editor, run both migration files in order:
1. Contents of `supabase/migrations/20260530000000_connexa_auth_backend.sql`
2. Contents of `supabase/migrations/20260530000001_connexa_main_features.sql`

- [ ] **Step 5: Set environment variables**

Update `connexa-app/.env.local`:
```
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

- [ ] **Step 6: Verify connection**

```bash
cd /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app && npx expo start --web
```

Open app in browser. Confirm no "Supabase is not configured" errors in console.

---

## Task 12: Final TypeScript + lint pass

- [ ] **Step 1: Full TypeScript check**

```bash
cd /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app && npx tsc --noEmit 2>&1
```

Expected: zero errors. Fix any that appear before proceeding.

- [ ] **Step 2: Verify no fixture imports remain in wired screens**

```bash
grep -r "DISCOVER_PROFILES\|MOCK_HOUSE\|MOCK_STANDINGS\|INTRODUCTION_CARDS" /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app/src/screens/
```

Expected: no output (all fixture imports replaced).

- [ ] **Step 3: Final commit**

```bash
git -C /Users/shivamvishwekar/Documents/connexa-v2-june/connexa-app status
```

If any uncommitted changes remain, commit them with appropriate message.

---

## Self-Review Notes

**Spec coverage check:**
- §1a FresherEmail → Google Form: Task 2 ✓
- §1b UserType enum: Task 1 ✓  
- §1c isAuthenticated routing: Task 3 ✓
- §1d SortingCardScreen error: Task 4 ✓
- §2a house_scores table: Task 5 ✓
- §2b introductions table: Task 5 ✓
- §2c housemate RLS policy: Task 5 ✓
- §3 getHouseMembers: Task 6 ✓
- §3 getHouseScores: Task 6 ✓
- §3 getMyIntroductions: Task 6 ✓
- §3 respondToIntroduction: Task 6 ✓
- §4 HouseHomeScreen wiring: Task 7 ✓
- §4 DiscoverScreen wiring: Task 8 ✓
- §4 LeaderboardScreen wiring: Task 9 ✓
- §4 IntroductionsScreen wiring: Task 10 ✓
- §5 Supabase setup: Task 11 ✓
- §6 Type additions: Task 6 ✓ (HouseScore, IntroductionWithProfile added to supabase.ts)

**Type consistency:** `HouseScore` defined in Task 6 and imported in Task 9 ✓. `IntroductionWithProfile` defined in Task 6 and imported in Task 10 ✓. `getHouseMembers` returns `ConnexaUser[]`, consumed correctly in Tasks 7 and 8 ✓. `ConnexaUser` extended with `updated_at` in Task 7 note ✓.

**Placeholder scan:** No TBD/TODO in code steps. `FRESHER_FORM_URL` placeholder flagged explicitly in Task 2 Step 1 with instruction to replace before go-live ✓.
