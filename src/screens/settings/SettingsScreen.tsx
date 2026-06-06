import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/types';
import { colors, fonts } from '@/tokens';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

type DarkMode = 'system' | 'light' | 'dark';

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={{
      fontFamily: fonts.label,
      fontSize: 10.5,
      textTransform: 'uppercase',
      letterSpacing: 1.68,
      color: colors.inkWhisper,
      paddingHorizontal: 24,
      paddingTop: 28,
      paddingBottom: 8,
    }}>
      {title}
    </Text>
  );
}

function Row({
  label,
  value,
  onPress,
  toggle,
  toggleValue,
  onToggle,
  destructive = false,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.75 : 1}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.hairlineSoft,
      }}
    >
      <Text style={{
        flex: 1,
        fontFamily: fonts.body,
        fontSize: 15,
        color: destructive ? colors.ember : colors.ink,
      }}>
        {label}
      </Text>
      {value !== undefined && (
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkWhisper }}>
          {value}
        </Text>
      )}
      {toggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ true: colors.ink, false: colors.hairline }}
          thumbColor={colors.khadi}
        />
      )}
    </TouchableOpacity>
  );
}

import { useNotificationSettings, NotificationSettings } from '@/hooks/useNotificationSettings';

export function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { data: settings, updateSettings } = useNotificationSettings();

  const [darkMode, setDarkMode] = useState<DarkMode>('system');

  const toggleNotif = (key: keyof NotificationSettings) => {
    if (!settings) return;
    updateSettings.mutate({ [key]: !settings[key] });
  };

  const handleLogOut = () => {
    Alert.alert(
      'Log out of Connexa?',
      '',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: signOut },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete your account?',
      'This removes your profile, your house progress, your responses, and all your data permanently. Your house leaderboard contributions will remain as anonymous points. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete my account',
          style: 'destructive',
          onPress: () => {
            // @ts-ignore
            Alert.prompt(
              'Final confirmation',
              'Type DELETE to confirm',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm deletion',
                  style: 'destructive',
                  onPress: (input?: string) => {
                    if (input?.trim() !== 'DELETE') {
                      Alert.alert('Incorrect', 'You must type DELETE exactly.');
                      return;
                    }
                    Alert.alert('Deletion scheduled', 'Your account will be removed shortly.');
                  },
                },
              ],
              'plain-text',
            );
          },
        },
      ],
    );
  };

  const darkLabel = darkMode === 'system' ? 'System' : darkMode === 'dark' ? 'Dark' : 'Light';
  const cycleDark = () => setDarkMode((d) => d === 'system' ? 'dark' : d === 'dark' ? 'light' : 'system');

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      {/* Top bar */}
      <View style={{ height: 48, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        <TouchableOpacity onPress={navigation.goBack} hitSlop={12}>
          <Icon name="chevronLeft" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={{
          flex: 1,
          fontFamily: fonts.label,
          fontSize: 12,
          textTransform: 'uppercase',
          letterSpacing: 1.68,
          color: colors.ink,
          textAlign: 'center',
        }}>
          Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}>
        <SectionHeader title="Account" />
        <Row label="Email" value={user?.email ?? '—'} />
        <Row label="IIT" value={user?.iit?.toUpperCase() ?? '—'} />
        <Row label="Branch" value={user?.branch ?? '—'} />
        <Row label="Log out" onPress={handleLogOut} />
        <Row label="Delete account" onPress={handleDeleteAccount} destructive />

        <SectionHeader title="Appearance" />
        <Row label="Dark mode" value={darkLabel} onPress={cycleDark} />

        <SectionHeader title="Notifications" />
        <Row label="Daily house prompt" toggle toggleValue={settings?.daily_prompt} onToggle={() => toggleNotif('daily_prompt')} />
        <Row label="Reactions on my responses" toggle toggleValue={settings?.reaction} onToggle={() => toggleNotif('reaction')} />
        <Row label="Invite converted" toggle toggleValue={settings?.invite_converted} onToggle={() => toggleNotif('invite_converted')} />
        <Row label="Retention bonus earned" toggle toggleValue={settings?.retention_bonus} onToggle={() => toggleNotif('retention_bonus')} />
        <Row label="New mutual match (Date)" toggle toggleValue={settings?.mutual_match} onToggle={() => toggleNotif('mutual_match')} />
        <Row label="Streak milestone" toggle toggleValue={settings?.streak_milestone} onToggle={() => toggleNotif('streak_milestone')} />
        <Row label="House rank changes" toggle toggleValue={settings?.house_rank_change} onToggle={() => toggleNotif('house_rank_change')} />
        <Row label="Monthly leaderboard reveal" toggle toggleValue={settings?.monthly_reveal} onToggle={() => toggleNotif('monthly_reveal')} />

        <SectionHeader title="Date" />
        <Row label="My Date profile" onPress={() => {}} />
        <Row label="Update matching preferences" onPress={() => {}} />
        <Row label="My interests" onPress={() => {}} />
        <Row label="My matches" onPress={() => {}} />
        <Row label="People I've hidden" onPress={() => {}} />

        <SectionHeader title="About" />
        <Row label="About Connexa" onPress={() => {}} />
        <Row label="Privacy policy" onPress={() => {}} />
        <Row label="Terms of use" onPress={() => {}} />
        <Row label="Contact / feedback" onPress={() => {}} />
        <Row label="App version" value="0.1.0" />

        {user?.is_admin && (
          <>
            <SectionHeader title="Admin" />
            <Row label="Admin panel" onPress={() => navigation.navigate('AdminPanel')} />
          </>
        )}
      </ScrollView>
    </View>
  );
}
