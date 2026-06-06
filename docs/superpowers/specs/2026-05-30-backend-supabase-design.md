# Backend & Supabase Design — Connexa App

**Date:** 2026-05-30  
**Scope:** Bug fixes + Supabase wiring for all screens

---

## 1. Bug Fixes

### 1a. FresherEmailScreen → Google Form redirect

`FresherEmailScreen` currently attempts OTP-based email verification, but freshers do not have institute emails at enrollment time. Replace the screen with a single-button UI that opens an external Google Form via `Linking.openURL`.

- Add `FRESHER_FORM_URL` constant to `src/fixtures/constants.ts` (placeholder value to be filled in)
- `FresherEmailScreen` renders a single "Open Form" button; no email input, no OTP
- Remove the `complete_email_verification` RPC call path for `user_type = 'fresher'` from `supabase.ts` (the function remains in DB for `student_25b` path)
- `FresherPathScreen` navigation: "Use email" button → `FresherEmail` still navigates there, but the screen is now a form-link screen

### 1b. UserType enum mismatch

`src/types/index.ts` defines `UserType = 'fresher' | 'iitb'`. Correct to match `supabase.ts`:

```ts
export type UserType = 'fresher' | 'student_25b' | 'student_other';
```

Audit all usages in navigation param types and screen props.

### 1c. isAuthenticated gate — verified-but-no-house state

Current `isAuthenticated = !!session && status === 'verified' && !!house`. A user who has verified but not completed sorting is stuck in `AuthNavigator` with no route to show.

`RootNavigator` logic (explicit):
- No session → `AuthNavigator` (splash/login flow)
- Session + `verification_status !== 'verified'` → `AuthNavigator` (handles unverified/pending/rejected)
- Session + `verification_status === 'verified'` + no `house` → `AuthNavigator` (sorting flow; `AuthNavigator` must include sorting screens — it already does)
- Session + `verification_status === 'verified'` + `house` set → `MainNavigator`

`isAuthenticated` in context stays as-is. The routing guard in `RootNavigator` checks `isVerified && !user.house` to show a dedicated "start sorting" entrypoint if the user lands back mid-flow.

### 1d. SortingCardScreen error handling

Inline `onPress` in `SortingCardScreen` calls `completeSorting` but silently drops errors. Add local `[err, setErr]` state; show error text if `result.error` is set.

---

## 2. Database — Second Migration

File: `supabase/migrations/20260530000001_connexa_main_features.sql`

### 2a. house_scores table

```sql
create table if not exists public.house_scores (
  id uuid primary key default gen_random_uuid(),
  house public.connexa_house not null,
  week_start date not null,
  score integer not null default 0,
  created_at timestamptz not null default now(),
  unique (house, week_start)
);
```

RLS:
- `authenticated` can SELECT all rows
- No user INSERT/UPDATE — scores updated by admin or future edge function
- Seed with initial zero rows for current week on migration

Grants: `grant select on public.house_scores to authenticated;`

### 2b. introductions table

```sql
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
```

RLS:
- SELECT: `from_user = auth.uid() OR to_user = auth.uid()`
- UPDATE: `to_user = auth.uid()` (only the recipient can respond)
- INSERT: admin only for now (matching logic TBD)

### 2c. New RLS policy on users — same-house visibility

Current policy restricts SELECT to own row or admin. Add:

```sql
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

This allows `DiscoverScreen` and `IntroductionsScreen` to query fellow house members.

---

## 3. supabase.ts — New Query Functions

Add to `src/lib/supabase.ts`:

### getHouseMembers(house: House): Promise<ConnexaUser[]>
```ts
SELECT * FROM users
WHERE house = $house AND verification_status = 'verified' AND id != auth.uid()
ORDER BY created_at ASC
```

### getHouseScores(): Promise<HouseScore[]>
```ts
SELECT * FROM house_scores
WHERE week_start = (current_date - extract(dow from current_date)::int)
ORDER BY score DESC
```
Returns array of `{ house: House; score: number; week_start: string }`.

### getMyIntroductions(): Promise<IntroductionWithProfile[]>
```ts
SELECT introductions.*, users.*
FROM introductions
JOIN users ON users.id = introductions.from_user
WHERE introductions.to_user = auth.uid() AND introductions.status = 'pending'
ORDER BY introductions.created_at DESC
```

### respondToIntroduction(id: string, response: 'accepted' | 'passed'): Promise<{ error: string | null }>
```ts
UPDATE introductions
SET status = $response, responded_at = now()
WHERE id = $id AND to_user = auth.uid()
```

---

## 4. Screen Wiring

### HouseHomeScreen
- Read `user.house` from `useAuth()` — no hardcoded `MOCK_HOUSE`
- Call `getHouseMembers(user.house)` → derive member count, active count (members with `updated_at > now() - interval '1 day'`)
- Real house color/name from `HOUSES[user.house]`

### DiscoverScreen
- Call `getHouseMembers(user.house)` → replace `DISCOVER_PROFILES` fixture
- Filter chips (All / Your IIT / Cross-IIT / By Branch) filter the fetched array client-side
- Member count in header derived from fetched array length

### LeaderboardScreen
- Call `getHouseScores()` → replace `MOCK_STANDINGS`
- Week label derived from `week_start` date

### IntroductionsScreen
- Call `getMyIntroductions()` → replace `INTRODUCTION_CARDS` fixture
- "Respond" button calls `respondToIntroduction(id, 'accepted')`
- "Pass" button calls `respondToIntroduction(id, 'passed')`
- Optimistic UI: remove card from list immediately on either action

---

## 5. Supabase Project Setup

Since no Supabase project exists yet:

1. Create project at supabase.com → get URL + anon key
2. Enable **Anonymous sign-ins** in Auth settings (required for `submitDocForm`)
3. Enable **Email OTP** in Auth settings (no password, magic link disabled)
4. Run migrations via Supabase dashboard SQL editor or `supabase db push`
5. Set `.env.local`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   ```

Add `supabase/config.toml` for local dev (optional but recommended).

---

## 6. Type Additions

Add to `src/lib/supabase.ts` (or a new `src/types/db.ts`):

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
  // joined user fields:
  display_name: string | null;
  photo_url: string | null;
  iit: string | null;
  branch: string | null;
  house: House | null;
}
```

---

## 7. Security Notes

- All new tables have RLS enabled before any data operations
- `house_scores` is read-only for clients; no client can inflate scores
- `introductions` INSERT locked to admin — prevents spam intro requests
- Storage paths are user-ID-prefixed — verified by policy (already done in migration 1)
- Anonymous user creation for doc form requires explicit dashboard toggle — must not be forgotten
- `jee_roll_number` is UNIQUE in `users` — prevents duplicate fresher registrations for same roll

---

## Out of Scope (This Sprint)

- Chat / DM after "Respond" — just accepts intro, no messaging table yet
- Date screen backend
- Push notifications for intro requests
- Admin dashboard for reviewing verification submissions
- `house_scores` write logic / point system definition
