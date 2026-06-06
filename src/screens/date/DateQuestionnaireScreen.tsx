import { Button } from '@/components/Button';
import { saveQuestionnaireAnswers, getQuestionnaireAnswers, updateDateProfile, saveSingleQuestionnaireAnswer } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DateStackParamList } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/tokens';

type Props = NativeStackScreenProps<DateStackParamList, 'DateQuestionnaire'>;

interface Question {
  id: string;
  type: 'slider' | 'pickN' | 'single';
  core: boolean;
  text: string;
  options?: string[];
  labels?: [string, string];
  max?: number;
}

const QUESTIONS: Question[] = [
  { id: 'Q1', core: true, type: 'slider', text: 'When life gets full, what gives?', labels: ['Always make time for people', 'Heads down till it\'s done'] },
  { id: 'Q2', core: true, type: 'slider', text: 'How do you want the next few years to feel?', labels: ['Build something big', 'Keep it light and live well'] },
  { id: 'Q3', core: false, type: 'pickN', text: 'What do you respect most in someone?', options: ['Honesty', 'Kindness', 'Ambition', 'Loyalty', 'Curiosity', 'Calm', 'Humor', 'Independence'], max: 3 },
  { id: 'Q4', core: false, type: 'slider', text: 'On a disagreement with someone you care about—', labels: ['Talk it out right away', 'Need space, come back later'] },
  { id: 'Q5', core: true, type: 'pickN', text: 'What do you actually spend free time on?', options: ['Sports/fitness', 'Gaming', 'Music (making)', 'Music (listening)', 'Reading', 'Coding side-projects', 'Movies/series', 'Art/design', 'Cooking/food', 'Outdoors/trekking', 'Writing', 'Dance', 'Photography', 'Volunteering', 'Just talking'], max: 5 },
  { id: 'Q6', core: false, type: 'pickN', text: 'What could you talk about for an hour without noticing?', options: ['Tech/startups', 'Films', 'Politics/society', 'Science', 'Sports', 'Music', 'Books', 'Philosophy/life', 'Campus stuff', 'Memes/internet'], max: 3 },
  { id: 'Q7', core: true, type: 'slider', text: 'Your kind of evening?', labels: ['Quiet night in', 'Out with people'] },
  { id: 'Q8', core: false, type: 'slider', text: 'Be honest about your clock.', labels: ['Early riser', 'Up all night'] },
  { id: 'Q9', core: true, type: 'slider', text: 'When you text someone you like—', labels: ['Reply fast, lots', 'Slow, thoughtful'] },
  { id: 'Q10', core: true, type: 'slider', text: 'Your humor runs—', labels: ['Dry/sarcastic', 'Warm/goofy'] },
  { id: 'Q11', core: false, type: 'slider', text: 'You\'d rather someone be—', labels: ['Direct, says it straight', 'Gentle, reads the room'] },
  { id: 'Q12', core: true, type: 'single', text: 'What are you here for, honestly?', options: ['Something serious', 'Open to see where it goes', 'Friends first', 'Not sure yet'] },
  { id: 'Q13', core: true, type: 'single', text: 'How much should we factor in faith / background when suggesting people?', options: ['Matters to me', 'Doesn\'t matter', 'Prefer not to say'] },
];

export function DateQuestionnaireScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getQuestionnaireAnswers(user.id).then(data => {
      const initialAnswers: Record<string, any> = {};
      data.forEach(a => {
        initialAnswers[a.question_id] = a.value_slider ?? a.value_tags ?? a.value_enum;
      });
      setAnswers(initialAnswers);
      setLoading(false);
    });
  }, [user]);

  const currentQuestion = QUESTIONS[currentIdx];
  const isLast = currentIdx === QUESTIONS.length - 1;

  const handleNext = () => {
    if (isLast) {
      finish();
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    
    const formatted = Object.entries(answers).map(([id, val]) => {
      const q = QUESTIONS.find(q => q.id === id);
      return {
        question_id: id,
        value_slider: q?.type === 'slider' ? val : undefined,
        value_tags: q?.type === 'pickN' ? val : undefined,
        value_enum: q?.type === 'single' ? val : undefined,
      };
    });

    const { error } = await saveQuestionnaireAnswers(user.id, formatted);
    
    if (error) {
      alert(error);
      setSaving(false);
      return;
    }

    // Initialize/Update profile row so we know they finished questionnaire
    await updateDateProfile(user.id, {
      display_name: user.display_name || 'Anonymous',
      iit: user.iit || 'iitb',
      branch: user.branch || 'unknown',
      year: Number(user.year ?? 2026),
      gender: user.gender || 'other',
      status: 'draft' // Keep as draft until photos/prompts are added in next screen
    });

    setSaving(false);
    navigation.replace('DateProfileSetup', { step: 1 });
  };

  const updateAnswer = async (id: string, val: any) => {
    if (!user) return;
    setAnswers(prev => ({ ...prev, [id]: val }));
    
    const q = QUESTIONS.find(q => q.id === id);
    const formatted = {
      question_id: id,
      value_slider: q?.type === 'slider' ? val : undefined,
      value_tags: q?.type === 'pickN' ? val : undefined,
      value_enum: q?.type === 'single' ? val : undefined,
    };
    
    // Fire and forget save for incremental progress
    saveSingleQuestionnaireAnswer(user.id, formatted);
  };

  const renderInput = () => {
    switch (currentQuestion.type) {
      case 'slider':
        return <SliderInput 
          labels={currentQuestion.labels!} 
          value={answers[currentQuestion.id] ?? 0.5} 
          onChange={(v) => {
            updateAnswer(currentQuestion.id, v);
            setTimeout(handleNext, 400);
          }} 
        />;
      case 'pickN':
        return <PickNInput 
          options={currentQuestion.options!} 
          max={currentQuestion.max!} 
          selected={answers[currentQuestion.id] ?? []} 
          onChange={(v) => updateAnswer(currentQuestion.id, v)} 
          onDone={handleNext}
        />;
      case 'single':
        return <SingleSelectInput 
          options={currentQuestion.options!} 
          selected={answers[currentQuestion.id]} 
          onSelect={(v) => {
            updateAnswer(currentQuestion.id, v);
            setTimeout(handleNext, 400);
          }} 
        />;
    }
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
      <View style={{ paddingHorizontal: 32, paddingTop: 24, flex: 1 }}>
        <Text style={{ 
          fontFamily: fonts.label, 
          fontSize: 10, 
          textTransform: 'uppercase', 
          letterSpacing: 1.6,
          color: colors.inkWhisper,
          marginBottom: 32
        }}>
          {currentIdx + 1} of {QUESTIONS.length}
        </Text>

        <Text style={{ 
          fontFamily: fonts.serif, 
          fontSize: 24, 
          lineHeight: 32,
          color: colors.ink,
          marginBottom: 48
        }}>
          {currentQuestion.text}
        </Text>

        {renderInput()}
      </View>

      {!currentQuestion.core && (
        <TouchableOpacity 
          onPress={handleNext}
          style={{ position: 'absolute', bottom: insets.bottom + 24, right: 32 }}
        >
          <Text style={{ 
            fontFamily: fonts.label, 
            fontSize: 12, 
            textTransform: 'uppercase', 
            letterSpacing: 1.2,
            color: colors.inkWhisper
          }}>
            Skip
          </Text>
        </TouchableOpacity>
      )}

      {saving && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(239,231,214,0.8)', alignItems: 'center', justifyContent: 'center' }]}>
          <Text style={{ fontFamily: fonts.serif, fontSize: 18, color: colors.ink }}>Saving...</Text>
        </View>
      )}
    </View>
  );
}

function SliderInput({ labels, value, onChange }: { labels: [string, string], value: number, onChange: (v: number) => void }) {
  const steps = [0, 0.25, 0.5, 0.75, 1];
  return (
    <View style={{ width: '100%' }}>
      <View style={{ height: 2, backgroundColor: colors.hairline, width: '100%', position: 'absolute', top: 12 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 0 }}>
        {steps.map((s) => (
          <TouchableOpacity 
            key={s} 
            onPress={() => onChange(s)}
            style={{ 
              width: 24, 
              height: 24, 
              borderRadius: 12, 
              backgroundColor: Math.abs(value - s) < 0.01 ? colors.ember : colors.khadi,
              borderWidth: 2,
              borderColor: Math.abs(value - s) < 0.01 ? colors.ember : colors.hairline
            }} 
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
        <Text style={{ fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.inkMute, width: '45%' }}>{labels[0]}</Text>
        <Text style={{ fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.inkMute, width: '45%', textAlign: 'right' }}>{labels[1]}</Text>
      </View>
    </View>
  );
}

function PickNInput({ options, max, selected, onChange, onDone }: { options: string[], max: number, selected: string[], onChange: (v: string[]) => void, onDone: () => void }) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else if (selected.length < max) {
      onChange([...selected, opt]);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: fonts.label, fontSize: 10, color: colors.inkWhisper, marginBottom: 16, textTransform: 'uppercase' }}>
        Pick up to {max}
      </Text>
      <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <TouchableOpacity 
              key={opt} 
              onPress={() => toggle(opt)}
              style={{ 
                paddingHorizontal: 16, 
                paddingVertical: 10, 
                backgroundColor: isSelected ? colors.ink : 'transparent',
                borderWidth: 1,
                borderColor: isSelected ? colors.ink : colors.hairline
              }}
            >
              <Text style={{ 
                fontFamily: fonts.serif, 
                fontSize: 14, 
                color: isSelected ? colors.khadi : colors.ink 
              }}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {selected.length > 0 && (
        <Button onPress={onDone} style={{ marginTop: 24, backgroundColor: colors.ink }}>
          Done
        </Button>
      )}
    </View>
  );
}

function SingleSelectInput({ options, selected, onSelect }: { options: string[], selected?: string, onSelect: (v: string) => void }) {
  return (
    <View style={{ gap: 12 }}>
      {options.map((opt) => (
        <TouchableOpacity 
          key={opt} 
          onPress={() => onSelect(opt)}
          style={{ 
            padding: 20, 
            backgroundColor: selected === opt ? colors.ink : 'transparent',
            borderWidth: 1,
            borderColor: selected === opt ? colors.ink : colors.hairline
          }}
        >
          <Text style={{ 
            fontFamily: fonts.serif, 
            fontSize: 16, 
            color: selected === opt ? colors.khadi : colors.ink 
          }}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
