import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors, fonts } from '@/tokens';
import { SeasonConfig, getSeasonConfig, updateSeasonConfig } from '@/lib/supabase';

export function SeasonControls() {
  const [config, setConfig] = useState<SeasonConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    setLoading(true);
    const data = await getSeasonConfig();
    setConfig(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleUpdate = async (patch: Partial<SeasonConfig>) => {
    const { error } = await updateSeasonConfig(patch);
    if (error) Alert.alert('Error', error);
    else fetchConfig();
  };

  if (loading) return <ActivityIndicator color={colors.ink} style={{ marginTop: 40 }} />;

  return (
    <View>
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: colors.ink }}>Season Controls</Text>
        <Text style={{ fontFamily: fonts.body, color: colors.inkWhisper, marginTop: 4 }}>
          Manage phase dates and trigger ceremonial moments.
        </Text>
      </View>

      <View style={{
        padding: 20,
        backgroundColor: colors.khadiLt,
        borderWidth: 1,
        borderColor: colors.hairline,
        borderRadius: 8,
        marginBottom: 20,
      }}>
        <Text style={{ fontFamily: fonts.label, fontSize: 10, color: colors.inkWhisper, textTransform: 'uppercase', marginBottom: 16 }}>Season Config</Text>
        
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink, marginBottom: 4 }}>Season Start</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 16, color: colors.inkWhisper }}>
            {config?.season_start ? new Date(config.season_start).toLocaleDateString() : '—'}
          </Text>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink, marginBottom: 4 }}>Season End</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 16, color: colors.inkWhisper }}>
            {config?.season_end ? new Date(config.season_end).toLocaleDateString() : '—'}
          </Text>
        </View>

        <TouchableOpacity 
          style={{ 
            backgroundColor: 'transparent', 
            paddingVertical: 10, 
            borderRadius: 4, 
            borderWidth: 1, 
            borderColor: colors.hairline,
            alignItems: 'center'
          }}
        >
          <Text style={{ fontFamily: fonts.label, fontSize: 10, color: colors.ink, fontWeight: '600' }}>EDIT DATES</Text>
        </TouchableOpacity>
      </View>

      <View style={{
        padding: 20,
        backgroundColor: colors.khadiLt,
        borderWidth: 1,
        borderColor: colors.hairline,
        borderRadius: 8,
        marginBottom: 20,
      }}>
        <Text style={{ fontFamily: fonts.serif, fontSize: 18, color: colors.ink }}>Monthly Reveal</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkWhisper, marginTop: 4, marginBottom: 16 }}>
          Triggers a ceremonial reveal for all users on their next Leaderboard open.
        </Text>
        <TouchableOpacity 
          onPress={() => handleUpdate({ reveal_triggered: true })}
          disabled={config?.reveal_triggered}
          style={{ 
            backgroundColor: config?.reveal_triggered ? colors.hairline : colors.ink, 
            paddingVertical: 12, 
            borderRadius: 4, 
            alignItems: 'center'
          }}
        >
          <Text style={{ fontFamily: fonts.label, fontSize: 10, color: colors.khadi, fontWeight: '600' }}>
            {config?.reveal_triggered ? 'REVEAL ACTIVE' : 'TRIGGER REVEAL'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{
        padding: 24,
        backgroundColor: 'rgba(168, 66, 31, 0.05)',
        borderWidth: 2,
        borderColor: 'rgba(168, 66, 31, 0.2)',
        borderRadius: 8,
      }}>
        <Text style={{ fontFamily: fonts.serif, fontSize: 18, color: colors.ember }}>The Crowning — Season End</Text>
        <View style={{ 
          backgroundColor: 'rgba(168, 66, 31, 0.1)', 
          borderLeftWidth: 3, 
          borderLeftColor: colors.ember,
          padding: 12,
          marginVertical: 16
        }}>
          <Text style={{ fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.ember, fontStyle: 'italic' }}>
            This ends Season 1. The leaderboard freezes. The ceremony fires for all users. This cannot be undone.
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => {
            Alert.alert(
              'Trigger The Crowning?',
              'This will end the season for ALL users. This action is permanent.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'END SEASON', style: 'destructive', onPress: () => handleUpdate({ crowning_done: true }) }
              ]
            );
          }}
          disabled={config?.crowning_done}
          style={{ 
            backgroundColor: config?.crowning_done ? colors.hairline : colors.ember, 
            paddingVertical: 14, 
            borderRadius: 4, 
            alignItems: 'center'
          }}
        >
          <Text style={{ fontFamily: fonts.label, fontSize: 12, color: colors.khadi, fontWeight: '700' }}>
            {config?.crowning_done ? 'SEASON ENDED' : 'TRIGGER THE CROWNING'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
