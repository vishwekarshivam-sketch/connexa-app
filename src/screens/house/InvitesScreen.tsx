import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Share, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HouseStackParamList, Invite } from '@/types';
import { colors, fonts, houseColors } from '@/tokens';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';
import { getMyInvites, createInvite } from '@/lib/supabase';
import { HOUSES } from '@/fixtures/houseData';

type Props = NativeStackScreenProps<HouseStackParamList, 'Invites'>;

export function InvitesScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const houseKey = user?.house ?? 'tinkerers';
  const house = HOUSES[houseKey];
  const houseColor = houseColors[houseKey];

  useEffect(() => {
    loadInvites();
  }, []);

  const loadInvites = async () => {
    setLoading(true);
    const data = await getMyInvites();
    setInvites(data);
    setLoading(false);
  };

  const handleShare = async () => {
    let activeInvite = invites.find(i => i.used_by === null);
    
    if (!activeInvite) {
      setCreating(true);
      const { data, error } = await createInvite();
      setCreating(false);
      if (error || !data) {
        // In a real app we would show a toast or alert
        console.error('Invite creation failed', error);
        return;
      }
      activeInvite = data;
      setInvites([data, ...invites]);
    }

    const inviteLink = `https://connexa.app/invite/${activeInvite.invite_code}`;
    try {
      await Share.share({
        message: `Join me in ${house.nameEn} on Connexa! Use my invite link to get started: ${inviteLink}`,
        url: inviteLink,
      });
    } catch (error) {
      console.error('Sharing failed', error);
    }
  };

  const renderInviteItem = ({ item }: { item: Invite }) => {
    const isConverted = !!item.used_by;
    const isVerified = item.bonus_earned;

    return (
      <View style={styles.inviteRow}>
        <View style={styles.inviteInfo}>
          <Text style={styles.inviteCode}>{item.invite_code}</Text>
          <Text style={styles.inviteDate}>
            Created {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.inviteStatus}>
          {isConverted ? (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {item.invitee_name || 'Joined'}
              </Text>
              {isVerified && (
                <View style={[styles.bonusTag, { backgroundColor: houseColor }]}>
                  <Text style={styles.bonusText}>+70 PTS</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.pendingText}>Pending</Text>
          )}
        </View>
      </View>
    );
  };

  const stats = {
    total: invites.length,
    converted: invites.filter(i => !!i.used_by).length,
    earned: invites.filter(i => i.bonus_earned).length * 70, // Total points earned (20 + 50)
  };

  return (
    <Screen style={{ backgroundColor: colors.khadi }}>
      <TopBar onBack={navigation.goBack} />
      
      <View style={styles.content}>
        {/* Share Header */}
        <View style={styles.shareHeader}>
          <Text style={styles.title}>Grow your house</Text>
          <Text style={styles.subtitle}>
            Invite friends to join {house.nameEn}. You both earn points when they verify.
          </Text>
          
          <TouchableOpacity 
            style={[styles.shareButton, { backgroundColor: houseColor }]}
            onPress={handleShare}
            disabled={creating}
            activeOpacity={0.8}
          >
            {creating ? (
              <ActivityIndicator color={colors.khadi} size="small" />
            ) : (
              <>
                <Icon name="share" size={20} color={colors.khadi} />
                <Text style={styles.shareButtonText}>Share Invite Link</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Invited</Text>
            <Text style={styles.statValue}>{stats.total}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Joined</Text>
            <Text style={styles.statValue}>{stats.converted}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Points</Text>
            <Text style={styles.statValue}>{stats.earned}</Text>
          </View>
        </View>

        {/* Invites List */}
        <Text style={styles.sectionTitle}>Your Invites</Text>
        {loading ? (
          <ActivityIndicator color={houseColor} style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={invites}
            renderItem={renderInviteItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>You haven't sent any invites yet.</Text>
            }
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    flex: 1,
  },
  shareHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 10,
  },
  shareButtonText: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.khadi,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.hairlineSoft,
    paddingVertical: 20,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: fonts.label,
    fontSize: 10,
    color: colors.inkWhisper,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.ink,
  },
  sectionTitle: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.inkMute,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 40,
  },
  inviteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
  },
  inviteInfo: {
    gap: 2,
  },
  inviteCode: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.ink,
    letterSpacing: 0.5,
  },
  inviteDate: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.inkWhisper,
  },
  inviteStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
  bonusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  bonusText: {
    fontFamily: fonts.label,
    fontSize: 9,
    color: colors.khadi,
    fontWeight: 'bold',
  },
  pendingText: {
    fontFamily: fonts.bodyItalic,
    fontSize: 13,
    color: colors.inkWhisper,
    fontStyle: 'italic',
  },
  emptyText: {
    fontFamily: fonts.bodyItalic,
    fontSize: 14,
    color: colors.inkWhisper,
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  }
});
