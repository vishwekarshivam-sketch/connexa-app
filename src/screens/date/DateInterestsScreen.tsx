import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DateStackParamList, Interest, DateProfile } from '@/types';
import { colors, fonts } from '@/tokens';
import { getMyInterests, getDateProfile, withdrawInterest } from '@/lib/supabase';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';
import { Alert } from 'react-native';

type Props = NativeStackScreenProps<DateStackParamList, 'DateInterests'>;

export function DateInterestsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [interests, setInterests] = useState<(Interest & { profile?: DateProfile | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const data = await getMyInterests(user.id);
      const withProfiles = await Promise.all(
        data.map(async (i) => ({
          ...i,
          profile: await getDateProfile(i.to_user)
        }))
      );
      setInterests(withProfiles);
      setLoading(false);
    }
    load();
  }, [user]);

  const handleWithdraw = (interestId: string, name: string) => {
    Alert.alert(
      'Withdraw Interest',
      `Are you sure you want to withdraw your interest in ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Withdraw', 
          style: 'destructive',
          onPress: async () => {
            const { error } = await withdrawInterest(interestId);
            if (error) {
              Alert.alert('Error', error);
            } else {
              setInterests(prev => prev.filter(i => i.id !== interestId));
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.khadi, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Icon name="chevronLeft" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Interests</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.intro}>
          You have {interests.length} of 3 interest slots in use. They'll expire in 14 days if not reciprocated.
        </Text>

        {interests.map((item) => (
          <View key={item.id} style={styles.interestCard}>
            <View style={styles.cardMain}>
              <View style={styles.photoContainer}>
                {item.profile?.photos?.[0] ? (
                  <Image source={{ uri: item.profile.photos[0].url }} style={styles.photo} />
                ) : (
                  <View style={[styles.photo, { backgroundColor: colors.khadiDeep }]} />
                )}
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.profile?.display_name || 'Anonymous'}</Text>
                <Text style={styles.status}>Pending · expires soon</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.withdrawButton}
              onPress={() => handleWithdraw(item.id, item.profile?.display_name || 'this person')}
            >
              <Text style={styles.withdrawText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        ))}

        {interests.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No pending interests.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft
  },
  headerTitle: {
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: colors.ink
  },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 24 },
  intro: { 
    fontFamily: fonts.body, 
    fontSize: 16, 
    color: colors.inkMute, 
    lineHeight: 24, 
    marginBottom: 32 
  },
  interestCard: { 
    backgroundColor: colors.khadi, 
    borderWidth: 1, 
    borderColor: colors.hairlineSoft, 
    padding: 16, 
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardMain: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  photoContainer: { width: 56, height: 56, backgroundColor: colors.khadiDeep },
  photo: { width: '100%', height: '100%' },
  info: { flex: 1 },
  name: { fontFamily: fonts.serif, fontSize: 18, color: colors.ink },
  status: { fontFamily: fonts.label, fontSize: 10, color: colors.inkWhisper, textTransform: 'uppercase', marginTop: 2 },
  withdrawButton: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.hairline },
  withdrawText: { fontFamily: fonts.label, fontSize: 10, color: colors.inkMute, textTransform: 'uppercase' },
  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontFamily: fonts.bodyItalic, fontSize: 16, color: colors.inkWhisper }
});
