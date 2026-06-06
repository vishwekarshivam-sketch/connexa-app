import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, fonts } from '@/tokens';
import { AdminNotification, getModerationReports, deleteModeratedContent, dismissModerationReport } from '@/lib/supabase';
import { timeAgo } from './utils';
import { Alert } from 'react-native';

export function ContentModeration() {
  const [activeTab, setActiveTab] = useState<'chat' | 'intro' | 'date'>('chat');
  const [reports, setReports] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const data = await getModerationReports(activeTab);
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const handleDelete = (report: AdminNotification) => {
    Alert.alert(
      'Delete Content?',
      'This will remove the reported content permanently.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'DELETE', 
          style: 'destructive', 
          onPress: async () => {
            const { error } = await deleteModeratedContent(report.id, report.category, report.reference_id || '');
            if (error) Alert.alert('Error', error);
            else fetchReports();
          }
        }
      ]
    );
  };

  const handleDismiss = async (reportId: string) => {
    const { error } = await dismissModerationReport(reportId);
    if (error) Alert.alert('Error', error);
    else fetchReports();
  };

  if (loading) return <ActivityIndicator color={colors.ink} style={{ marginTop: 40 }} />;

  return (
    <View>
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: colors.ink }}>Content Moderation</Text>
        <Text style={{ fontFamily: fonts.body, color: colors.inkWhisper, marginTop: 4 }}>
          Review reported content across all surfaces.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.hairline, marginBottom: 20 }}>
        {(['chat', 'intro', 'date'] as const).map((tab) => (
          <TouchableOpacity 
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{ 
              paddingVertical: 12, 
              paddingHorizontal: 16, 
              borderBottomWidth: 2, 
              borderBottomColor: activeTab === tab ? colors.ink : 'transparent' 
            }}
          >
            <Text style={{ 
              fontFamily: fonts.label, 
              fontSize: 10, 
              color: activeTab === tab ? colors.ink : colors.inkWhisper,
              textTransform: 'uppercase',
              letterSpacing: 1.2
            }}>
              {tab.toUpperCase()} REPORTS
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {reports.length === 0 ? (
        <Text style={{ textAlign: 'center', color: colors.inkWhisper, marginTop: 40, fontFamily: fonts.body }}>
          No {activeTab} reports to review.
        </Text>
      ) : (
        reports.map((r) => (
          <View key={r.id} style={{
            padding: 16,
            backgroundColor: colors.khadiLt,
            borderWidth: 1,
            borderColor: colors.hairline,
            borderRadius: 8,
            marginBottom: 12,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontFamily: fonts.label, fontSize: 9, color: colors.ember, textTransform: 'uppercase' }}>
                {r.category.replace('report_', '').toUpperCase()}
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.inkWhisper }}>
                {timeAgo(r.created_at)}
              </Text>
            </View>
            <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink, lineHeight: 20 }}>
              {r.body}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <TouchableOpacity style={{ 
                backgroundColor: colors.ink, 
                paddingHorizontal: 12, 
                paddingVertical: 6, 
                borderRadius: 4,
                marginRight: 8
              }}>
                <Text style={{ fontFamily: fonts.label, fontSize: 9, color: colors.khadi }}>VIEW CONTEXT</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleDelete(r)}
                style={{ 
                  backgroundColor: colors.ember, 
                  paddingHorizontal: 12, 
                  paddingVertical: 6, 
                  borderRadius: 4,
                  marginRight: 8
                }}
              >
                <Text style={{ fontFamily: fonts.label, fontSize: 9, color: colors.khadi }}>DELETE</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleDismiss(r.id)}
                style={{ 
                  backgroundColor: 'transparent', 
                  paddingHorizontal: 12, 
                  paddingVertical: 6, 
                  borderRadius: 4, 
                  borderWidth: 1, 
                  borderColor: colors.hairline 
                }}
              >
                <Text style={{ fontFamily: fonts.label, fontSize: 9, color: colors.inkWhisper }}>DISMISS</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
