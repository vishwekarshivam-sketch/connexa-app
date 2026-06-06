import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '@/types';
import { colors, fonts } from '@/tokens';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/context/AuthContext';
import { getPendingVerifications, supabase } from '@/lib/supabase';

// Section Components
import { VerificationQueue } from './sections/VerificationQueue';
import { HouseLeaders } from './sections/HouseLeaders';
import { Prompts } from './sections/Prompts';
import { Lore } from './sections/Lore';
import { ActivityFlags } from './sections/ActivityFlags';
import { ContentModeration } from './sections/ContentModeration';
import { SeasonControls } from './sections/SeasonControls';

type SectionId = 'vq' | 'leaders' | 'prompts' | 'lore' | 'flags' | 'moderation' | 'season';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminDashboard'>;

export function AdminPanelScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionId>('vq');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Initial fetch for pending count
    getPendingVerifications().then(list => setPendingCount(list.length));
    
    // Subscribe to verification submissions
    const sub = supabase
      ?.channel('admin_vq_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'verification_submissions' }, () => {
        getPendingVerifications().then(list => setPendingCount(list.length));
      })
      .subscribe();

    return () => {
      sub?.unsubscribe();
    };
  }, []);

  const isDesktop = width > 768;

  const sections: { id: SectionId; label: string; icon: any; badge?: number }[] = [
    { id: 'vq', label: 'Verification Queue', icon: 'shield', badge: pendingCount },
    { id: 'leaders', label: 'House Leaders', icon: 'users' },
    { id: 'prompts', label: 'Prompts', icon: 'messageSquare' },
    { id: 'lore', label: 'Lore', icon: 'bookOpen' },
    { id: 'flags', label: 'Activity Flags', icon: 'flag' },
    { id: 'moderation', label: 'Content Moderation', icon: 'shieldOff' },
    { id: 'season', label: 'Season Controls', icon: 'settings' },
  ];

  const renderSidebar = () => (
    <View style={{
      width: isDesktop ? 240 : '100%',
      backgroundColor: colors.ink,
      borderRightWidth: isDesktop ? 1 : 0,
      borderRightColor: 'rgba(239, 231, 214, 0.08)',
      paddingTop: isDesktop ? insets.top + 20 : 0,
    }}>
      {isDesktop && (
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text style={{
            fontFamily: fonts.label,
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 2.4,
            textTransform: 'uppercase',
            color: colors.khadi,
            opacity: 0.9,
          }}>
            Connexa · Admin
          </Text>
          <Text style={{
            fontFamily: fonts.body,
            fontSize: 12,
            fontStyle: 'italic',
            color: 'rgba(239, 231, 214, 0.4)',
            marginTop: 2,
          }}>
            {user?.email}
          </Text>
        </View>
      )}

      <ScrollView 
        horizontal={!isDesktop} 
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingVertical: isDesktop ? 12 : 8, paddingHorizontal: isDesktop ? 0 : 16 }}
      >
        {sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            onPress={() => setActiveSection(section.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: isDesktop ? 12 : 8,
              paddingHorizontal: 20,
              backgroundColor: activeSection === section.id ? 'rgba(239, 231, 214, 0.08)' : 'transparent',
              borderLeftWidth: isDesktop && activeSection === section.id ? 2 : 0,
              borderLeftColor: colors.khadi,
              marginRight: isDesktop ? 0 : 8,
              borderRadius: isDesktop ? 0 : 4,
            }}
          >
            <Text style={{
              fontFamily: fonts.label,
              fontSize: 10,
              fontWeight: '500',
              letterSpacing: 1.4,
              textTransform: 'uppercase',
              color: activeSection === section.id ? colors.khadi : 'rgba(239, 231, 214, 0.5)',
            }}>
              {section.label}
            </Text>
            {section.badge !== undefined && section.badge > 0 && (
              <View style={{
                marginLeft: 8,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: colors.ember,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 4,
              }}>
                <Text style={{
                  fontFamily: fonts.label,
                  fontSize: 9,
                  fontWeight: '600',
                  color: colors.khadi,
                }}>
                  {section.badge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'vq': return <VerificationQueue />;
      case 'leaders': return <HouseLeaders />;
      case 'prompts': return <Prompts />;
      case 'lore': return <Lore />;
      case 'flags': return <ActivityFlags />;
      case 'moderation': return <ContentModeration />;
      case 'season': return <SeasonControls />;
      default: return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, flexDirection: isDesktop ? 'row' : 'column' }}>
      {isDesktop ? renderSidebar() : (
        <View style={{ paddingTop: insets.top, backgroundColor: colors.ink }}>
          {renderSidebar()}
        </View>
      )}

      <View style={{ flex: 1 }}>
        <View style={{
          height: 52,
          paddingHorizontal: 28,
          borderBottomWidth: 1,
          borderBottomColor: colors.hairline,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.khadiLt,
        }}>
          {!isDesktop && (
            <TouchableOpacity onPress={navigation.goBack} style={{ marginRight: 16 }}>
              <Icon name="chevronLeft" size={24} color={colors.ink} />
            </TouchableOpacity>
          )}
          <Text style={{
            fontFamily: fonts.serif,
            fontSize: 18,
            fontWeight: '500',
            color: colors.ink,
          }}>
            {sections.find(s => s.id === activeSection)?.label}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isDesktop && (
              <Text style={{
                fontFamily: fonts.body,
                fontSize: 12,
                fontStyle: 'italic',
                color: colors.inkWhisper,
                marginRight: 16,
              }}>
                {user?.email}
              </Text>
            )}
            <TouchableOpacity>
              <Icon name="bell" size={20} color={colors.inkWhisper} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 28 }}>
          {renderContent()}
        </ScrollView>
      </View>
    </View>
  );
}
