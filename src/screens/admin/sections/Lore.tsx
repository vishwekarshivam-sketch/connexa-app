import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, ActivityIndicator, TextInput } from 'react-native';
import { colors, fonts } from '@/tokens';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/Button';
import { House } from '@/types';
import { supabase } from '@/lib/supabase';

export function Lore() {
  const [loreEntries, setLoreEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newLore, setNewLore] = useState({ text: '', house: 'tinkerers' as House, week: 1 });
  const [submitting, setSubmitting] = useState(false);

  const fetchLore = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('house_lore')
      .select('*')
      .order('week_number', { ascending: false });
    
    if (!error) setLoreEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLore();
  }, []);

  const handleCreate = async () => {
    if (!newLore.text.trim()) return;
    setSubmitting(true);
    const { error } = await supabase
      .from('house_lore')
      .insert({
        text: newLore.text.trim(),
        house: newLore.house,
        week_number: newLore.week,
        attribution: `House of ${newLore.house.charAt(0).toUpperCase() + newLore.house.slice(1)}`
      });
    
    setSubmitting(false);
    if (error) Alert.alert('Error', error.message);
    else {
      setShowModal(false);
      setNewLore({ text: '', house: 'tinkerers', week: loreEntries.length + 1 });
      fetchLore();
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Lore', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('house_lore').delete().eq('id', id);
          if (error) Alert.alert('Error', error.message);
          else fetchLore();
        }
      }
    ]);
  };

  if (loading) return <ActivityIndicator color={colors.ink} style={{ marginTop: 40 }} />;

  return (
    <View>
      <View style={{ marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: colors.ink }}>House Lore</Text>
          <Text style={{ fontFamily: fonts.body, color: colors.inkWhisper, marginTop: 4 }}>
            Manage weekly mythic drops for each house.
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => setShowModal(true)}
          style={{ backgroundColor: colors.ink, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4 }}
        >
          <Text style={{ fontFamily: fonts.label, fontSize: 10, color: colors.khadi, fontWeight: '600' }}>+ NEW LORE</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: 60, paddingHorizontal: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ fontFamily: fonts.serif, fontSize: 24 }}>New Lore Drop</Text>
            <TouchableOpacity onPress={() => setShowModal(false)} hitSlop={12}>
              <Icon name="x" size={24} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontFamily: fonts.label, fontSize: 11, marginBottom: 8 }}>LORE TEXT</Text>
            <TextInput
              style={{
                backgroundColor: colors.khadiLt,
                borderWidth: 1,
                borderColor: colors.hairline,
                borderRadius: 8,
                padding: 16,
                fontFamily: fonts.body,
                fontSize: 16,
                minHeight: 120,
                textAlignVertical: 'top'
              }}
              multiline
              maxLength={400}
              placeholder="Enter the mythic quote..."
              value={newLore.text}
              onChangeText={(text) => setNewLore(prev => ({ ...prev, text }))}
            />
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontFamily: fonts.label, fontSize: 11, marginBottom: 12 }}>HOUSE</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(['tinkerers', 'wanderers', 'strategists', 'mavericks'] as const).map(h => (
                <TouchableOpacity
                  key={h}
                  onPress={() => setNewLore(prev => ({ ...prev, house: h }))}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: colors.hairline,
                    backgroundColor: newLore.house === h ? colors.ink : 'transparent'
                  }}
                >
                  <Text style={{ 
                    fontFamily: fonts.label, 
                    fontSize: 10, 
                    color: newLore.house === h ? colors.khadi : colors.inkMute,
                    textTransform: 'uppercase'
                  }}>{h}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontFamily: fonts.label, fontSize: 11, marginBottom: 12 }}>WEEK NUMBER</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[1, 2, 3, 4, 5, 6].map(w => (
                <TouchableOpacity
                  key={w}
                  onPress={() => setNewLore(prev => ({ ...prev, week: w }))}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: colors.hairline,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: newLore.week === w ? colors.ink : 'transparent'
                  }}
                >
                  <Text style={{ color: newLore.week === w ? colors.khadi : colors.ink }}>{w}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button 
            title={submitting ? "Saving..." : "Save Lore Entry"} 
            onPress={handleCreate} 
            disabled={submitting || !newLore.text.trim()}
          />
        </View>
      </Modal>

      <View style={{
        padding: 16,
        backgroundColor: colors.khadiLt,
        borderWidth: 1,
        borderColor: colors.hairline,
        borderRadius: 8,
      }}>
        {loreEntries.length === 0 ? (
          <Text style={{ textAlign: 'center', color: colors.inkWhisper, padding: 20 }}>No lore entries found.</Text>
        ) : loreEntries.map((entry, i) => (
          <View key={entry.id} style={{
            flexDirection: 'row',
            paddingVertical: 16,
            borderBottomWidth: i === loreEntries.length - 1 ? 0 : 1,
            borderBottomColor: colors.hairlineSoft,
            alignItems: 'flex-start',
          }}>
            <View style={{ width: 60 }}>
              <Text style={{ 
                fontFamily: fonts.label, 
                fontSize: 9, 
                color: colors.inkWhisper,
                fontWeight: '600'
              }}>
                WEEK {entry.week_number}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ alignSelf: 'flex-start', marginBottom: 4 }}>
                <Text style={{ 
                  fontFamily: fonts.label, 
                  fontSize: 8, 
                  color: colors.inkWhisper, 
                  textTransform: 'uppercase',
                  borderWidth: 1,
                  borderColor: colors.hairline,
                  paddingHorizontal: 4,
                  borderRadius: 2
                }}>
                  {entry.house ? 'HOUSE' : 'UNIVERSAL'}
                </Text>
              </View>
              <Text style={{ 
                fontFamily: fonts.bodyItalic, 
                fontSize: 14, 
                color: colors.ink,
                fontStyle: 'italic',
                lineHeight: 20
              }}>
                {entry.text}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', marginLeft: 12 }}>
              <TouchableOpacity onPress={() => handleDelete(entry.id)}>
                <Icon name="trash" size={16} color={colors.ember} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
