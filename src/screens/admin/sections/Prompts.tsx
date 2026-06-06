import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, ActivityIndicator, TextInput } from 'react-native';
import { colors, fonts } from '@/tokens';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/Button';
import { House } from '@/types';
import { HousePrompt, supabase, getScheduledPrompts } from '@/lib/supabase';

export function Prompts() {
  const [prompts, setPrompts] = useState<HousePrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPrompt, setNewPrompt] = useState({ text: '', target: 'universal' as House | 'universal', date: new Date().toISOString() });
  const [submitting, setSubmitting] = useState(false);

  const fetchPrompts = async () => {
    setLoading(true);
    const data = await getScheduledPrompts();
    setPrompts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleCreate = async () => {
    if (!newPrompt.text.trim()) return;
    setSubmitting(true);
    const { error } = await supabase
      .from('house_prompts')
      .insert({
        prompt_text: newPrompt.text.trim(),
        house: newPrompt.target === 'universal' ? null : newPrompt.target,
        scheduled_for: newPrompt.date
      });
    
    setSubmitting(false);
    if (error) Alert.alert('Error', error.message);
    else {
      setShowModal(false);
      setNewPrompt({ text: '', target: 'universal', date: new Date().toISOString() });
      fetchPrompts();
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Prompt', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('house_prompts').delete().eq('id', id);
          if (error) Alert.alert('Error', error.message);
          else fetchPrompts();
        }
      }
    ]);
  };

  if (loading) return <ActivityIndicator color={colors.ink} style={{ marginTop: 40 }} />;

  return (
    <View>
      <View style={{ marginBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: colors.ink }}>Prompts</Text>
          <Text style={{ fontFamily: fonts.body, color: colors.inkWhisper, marginTop: 4 }}>
            Manage the daily prompt schedule for all houses.
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => setShowModal(true)}
          style={{ backgroundColor: colors.ink, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4 }}
        >
          <Text style={{ fontFamily: fonts.label, fontSize: 10, color: colors.khadi, fontWeight: '600' }}>+ NEW PROMPT</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: 60, paddingHorizontal: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ fontFamily: fonts.serif, fontSize: 24 }}>New Prompt</Text>
            <TouchableOpacity onPress={() => setShowModal(false)} hitSlop={12}>
              <Icon name="x" size={24} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontFamily: fonts.label, fontSize: 11, marginBottom: 8 }}>PROMPT TEXT</Text>
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
              maxLength={300}
              placeholder="What's your Sunday ritual?"
              value={newPrompt.text}
              onChangeText={(text) => setNewPrompt(prev => ({ ...prev, text }))}
            />
          </View>

          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontFamily: fonts.label, fontSize: 11, marginBottom: 12 }}>TARGET HOUSE</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(['universal', 'tinkerers', 'wanderers', 'strategists', 'mavericks'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setNewPrompt(prev => ({ ...prev, target: t }))}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: colors.hairline,
                    backgroundColor: newPrompt.target === t ? colors.ink : 'transparent'
                  }}
                >
                  <Text style={{ 
                    fontFamily: fonts.label, 
                    fontSize: 10, 
                    color: newPrompt.target === t ? colors.khadi : colors.inkMute,
                    textTransform: 'uppercase'
                  }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button 
            title={submitting ? "Saving..." : "Schedule Prompt"} 
            onPress={handleCreate} 
            disabled={submitting || !newPrompt.text.trim()}
          />
        </View>
      </Modal>

      {prompts.length === 0 ? (
        <Text style={{ textAlign: 'center', color: colors.inkWhisper, marginTop: 40, fontFamily: fonts.body }}>No prompts scheduled.</Text>
      ) : (
        prompts.map((p) => (
          <View key={p.id} style={{
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
                backgroundColor: colors.khadiDk, 
                borderRadius: 4,
                borderWidth: 1,
                borderColor: colors.hairline
              }}>
                <Text style={{ fontFamily: fonts.label, fontSize: 9, color: colors.ink, textTransform: 'uppercase' }}>
                  {p.house?.toUpperCase() || 'UNIVERSAL'}
                </Text>
              </View>
              <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.inkWhisper }}>
                {new Date(p.scheduled_for).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </Text>
            </View>
            <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.ink, lineHeight: 22 }}>
              {p.prompt_text}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 12, justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => handleDelete(p.id)}>
                <Text style={{ fontFamily: fonts.label, fontSize: 10, color: colors.ember }}>DELETE</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
