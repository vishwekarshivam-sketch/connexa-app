import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { colors, fonts } from '@/tokens';
import { Icon } from '@/components/Icon';
import { 
  getPendingVerifications, 
  approveVerification, 
  rejectVerification, 
  getVerificationDocUrl,
  VerificationSubmission
} from '@/lib/supabase';
import { timeAgo, getTimeColor } from './utils';
import { Skeleton } from '@/components/Skeleton';

export function VerificationQueue() {
  const [list, setList] = useState<VerificationSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const fetchList = async () => {
    setLoading(true);
    const data = await getPendingVerifications();
    setList(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleApprove = async (sub: VerificationSubmission) => {
    Alert.alert(
      'Approve Submission',
      `Approve ${sub.user?.display_name || 'User'} (${sub.iit.toUpperCase()})? This lets them into the app.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve', 
          onPress: async () => {
            const { error } = await approveVerification(sub.id);
            if (error) Alert.alert('Error', error);
            else fetchList();
          }
        }
      ]
    );
  };

  const handleReject = async (sub: VerificationSubmission) => {
    Alert.prompt(
      'Reject Submission',
      'Reason (shown to the user) - optional',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: async (reason?: string) => {
            const { error } = await rejectVerification(sub.id, reason);
            if (error) Alert.alert('Error', error);
            else fetchList();
          }
        }
      ]
    );
  };

  if (loading) return <VerificationQueueSkeleton />;

  if (list.length === 0) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <Text style={{ fontFamily: fonts.body, color: colors.inkWhisper }}>No pending verifications.</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: colors.ink }}>Verification Queue</Text>
        <Text style={{ fontFamily: fonts.body, color: colors.inkWhisper, marginTop: 4 }}>
          Speed is key. Approve or reject newcomers.
        </Text>
      </View>

      {list.map((sub) => (
        <View key={sub.id} style={{
          flexDirection: 'row',
          padding: 16,
          backgroundColor: colors.khadiLt,
          borderRadius: 8,
          marginBottom: 12,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.hairline,
        }}>
          <TouchableOpacity onPress={() => sub.doc_url && setSelectedDoc(getVerificationDocUrl(sub.doc_url))}>
            {sub.doc_url ? (
              <Image 
                source={{ uri: getVerificationDocUrl(sub.doc_url) }} 
                style={{ width: 48, height: 48, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.05)' }} 
              />
            ) : (
              <View style={{ width: 48, height: 48, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="fileText" size={20} color={colors.inkWhisper} />
              </View>
            )}
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text style={{ fontFamily: fonts.serif, fontSize: 16, color: colors.ink }}>{sub.user?.display_name || 'Unknown'}</Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkWhisper }}>
                  {sub.iit.toUpperCase()} · Roll: {sub.roll_number || 'N/A'}
                </Text>
              </View>
              <Text style={{ 
                fontFamily: fonts.label, 
                fontSize: 10, 
                color: getTimeColor(sub.created_at),
                fontWeight: '600'
              }}>
                {timeAgo(sub.created_at)}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <TouchableOpacity 
                onPress={() => handleApprove(sub)}
                style={{ 
                  backgroundColor: colors.ink, 
                  paddingHorizontal: 16, 
                  paddingVertical: 6, 
                  borderRadius: 4,
                  marginRight: 8
                }}
              >
                <Text style={{ fontFamily: fonts.label, fontSize: 10, color: colors.khadi, fontWeight: '600' }}>APPROVE</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleReject(sub)}
                style={{ 
                  backgroundColor: colors.ember, 
                  paddingHorizontal: 16, 
                  paddingVertical: 6, 
                  borderRadius: 4 
                }}
              >
                <Text style={{ fontFamily: fonts.label, fontSize: 10, color: colors.khadi, fontWeight: '600' }}>REJECT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      <Modal visible={!!selectedDoc} transparent={false} animationType="fade">
        <View style={{ flex: 1, backgroundColor: colors.ink }}>
          <TouchableOpacity 
            onPress={() => setSelectedDoc(null)}
            style={{ 
              position: 'absolute', 
              top: 50, 
              right: 20, 
              zIndex: 1,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon name="x" size={24} color={colors.khadi} />
          </TouchableOpacity>
          {selectedDoc && (
            <Image 
              source={{ uri: selectedDoc }} 
              style={{ flex: 1, resizeMode: 'contain' }} 
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

function VerificationQueueSkeleton() {
  return (
    <View>
      <View style={{ marginBottom: 24 }}>
        <Skeleton width={200} height={24} style={{ marginBottom: 8 }} />
        <Skeleton width={300} height={14} />
      </View>
      {[1, 2, 3].map(i => (
        <View key={i} style={{ flexDirection: 'row', padding: 16, backgroundColor: colors.khadiLt, borderRadius: 8, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.hairline }}>
          <Skeleton width={48} height={48} radius={4} />
          <View style={{ flex: 1, marginLeft: 16, gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Skeleton width={120} height={18} />
              <Skeleton width={60} height={10} />
            </View>
            <Skeleton width={100} height={12} />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <Skeleton width={80} height={24} radius={4} />
              <Skeleton width={80} height={24} radius={4} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
