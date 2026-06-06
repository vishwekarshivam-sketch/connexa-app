import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, fonts } from '@/tokens';
import { AdminNotification, getActivityFlags } from '@/lib/supabase';
import { timeAgo } from './utils';

export function ActivityFlags() {
  const [flags, setFlags] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlags = async () => {
    setLoading(true);
    const data = await getActivityFlags();
    setFlags(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  if (loading) return <ActivityIndicator color={colors.ink} style={{ marginTop: 40 }} />;

  return (
    <View>
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: colors.ink }}>Activity Flags</Text>
        <Text style={{ fontFamily: fonts.body, color: colors.inkWhisper, marginTop: 4 }}>
          Monitor suspicious growth and potential system gaming.
        </Text>
      </View>

      {flags.length === 0 ? (
        <Text style={{ textAlign: 'center', color: colors.inkWhisper, marginTop: 40, fontFamily: fonts.body }}>
          No suspicious activity flagged.
        </Text>
      ) : (
        flags.map((f) => (
          <View key={f.id} style={{
            padding: 16,
            backgroundColor: colors.khadiLt,
            borderWidth: 1,
            borderColor: colors.hairline,
            borderRadius: 8,
            marginBottom: 12,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ 
                paddingHorizontal: 8, 
                paddingVertical: 2, 
                backgroundColor: 'rgba(168, 66, 31, 0.1)', 
                borderRadius: 4
              }}>
                <Text style={{ fontFamily: fonts.label, fontSize: 9, color: colors.ember, fontWeight: '600' }}>SUSPICIOUS PATTERN</Text>
              </View>
              <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.inkWhisper }}>
                {timeAgo(f.created_at)}
              </Text>
            </View>
            <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink, lineHeight: 22 }}>
              {f.body}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <TouchableOpacity style={{ 
                backgroundColor: colors.ink, 
                paddingHorizontal: 12, 
                paddingVertical: 6, 
                borderRadius: 4,
                marginRight: 8
              }}>
                <Text style={{ fontFamily: fonts.label, fontSize: 9, color: colors.khadi }}>VIEW DETAILS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ 
                backgroundColor: 'transparent', 
                paddingHorizontal: 12, 
                paddingVertical: 6, 
                borderRadius: 4,
                borderWidth: 1,
                borderColor: colors.hairline
              }}>
                <Text style={{ fontFamily: fonts.label, fontSize: 9, color: colors.inkWhisper }}>DISMISS</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
