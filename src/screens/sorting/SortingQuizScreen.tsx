import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { SORTING_QUESTIONS } from '@/fixtures/sortingQuestions';
import { scoreHouse } from '@/fixtures/houseData';
import { colors, fonts } from '@/tokens';
import { completeSorting } from '@/lib/supabase';

type Props = NativeStackScreenProps<AuthStackParamList, 'SortingQuiz'>;

const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX'];

export function SortingQuizScreen({ navigation }: Props) {
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const q = SORTING_QUESTIONS[qIdx];
  const total = SORTING_QUESTIONS.length;

  const advance = async () => {
    if (selected === null) return;
    const houseKey = q.options[parseInt(selected)].house;
    const next = [...answers, houseKey];
    
    if (qIdx + 1 >= total) {
      setSaving(true);
      const result = scoreHouse(next);
      
      // Save to database
      const formattedResponses: Record<string, any> = {};
      next.forEach((ans, i) => {
        formattedResponses[`q${i+1}`] = ans;
      });
      
      const { error } = await completeSorting(result.house.id, formattedResponses, result.scores);
      
      if (error) {
        console.error('Error saving sorting results:', error);
      }
      
      setSaving(false);
      navigation.navigate('SortingReveal', { house: result.house.id });
    } else {
      setAnswers(next);
      setQIdx((i) => i + 1);
      setSelected(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.ink }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, paddingTop: 56 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 40 }}>
          <Text style={{ 
            fontFamily: fonts.serif, 
            fontSize: 32, 
            color: colors.khadi, 
            fontWeight: '300' 
          }}>
            {ROMAN[qIdx]}
          </Text>
          <Text style={{ 
            fontFamily: fonts.label, 
            fontSize: 11, 
            color: 'rgba(239,231,214,0.4)', 
            letterSpacing: 1.6 
          }}>
            / {ROMAN[total - 1]}
          </Text>
        </View>

        <Text style={{ 
          fontFamily: fonts.serif, 
          fontSize: 26, 
          fontWeight: '300', 
          color: colors.khadi, 
          lineHeight: 32, 
          marginBottom: 36 
        }}>
          {q.text}
        </Text>

        <View style={{ gap: 12 }}>
          {q.options.map((opt, i) => {
            const on = selected === String(i);
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setSelected(String(i))}
                activeOpacity={0.85}
                disabled={saving}
                style={{
                  borderWidth: 1,
                  borderColor: on ? 'rgba(239,231,214,0.6)' : 'rgba(239,231,214,0.15)',
                  backgroundColor: on ? 'rgba(239,231,214,0.07)' : 'transparent',
                  padding: 20,
                }}
              >
                <Text style={{ 
                  fontFamily: fonts.body, 
                  fontSize: 16, 
                  color: colors.khadi, 
                  lineHeight: 24 
                }}>
                  {opt.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selected !== null && (
          <TouchableOpacity
            onPress={advance}
            disabled={saving}
            style={{ 
              marginTop: 32, 
              alignSelf: 'flex-end', 
              flexDirection: 'row', 
              alignItems: 'center', 
              gap: 10 
            }}
          >
            {saving ? (
              <ActivityIndicator color={colors.khadi} size="small" />
            ) : (
              <Text style={{ 
                fontFamily: fonts.label, 
                fontSize: 11, 
                fontWeight: '500', 
                textTransform: 'uppercase', 
                letterSpacing: 2.2, 
                color: colors.khadi 
              }}>
                {qIdx + 1 >= total ? 'Reveal' : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
