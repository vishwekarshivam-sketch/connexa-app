import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DateStackParamList, ProfilePhoto } from '@/types';
import { colors, fonts } from '@/tokens';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { uploadDatePhoto, updateDateProfile, savePromptAnswers, getDateProfile, getQuestionnaireAnswers } from '@/lib/supabase';
import { Icon } from '@/components/Icon';

type Props = NativeStackScreenProps<DateStackParamList, 'DateProfileSetup'>;

const PROMPT_OPTIONS = [
  "A small thing that makes my day—",
  "Sunday at IIT looks like—",
  "I could talk for hours about—",
  "Lately I've been into—",
  "I get along best with people who—",
  "Two truths and a maybe—",
  "My most defensible hot take—",
  "What a good day with someone looks like—"
];

export function DateProfileSetupScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const initialStep = Number(route.params?.step ?? 1);
  const [step, setStep] = useState(initialStep);
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [bio, setBio] = useState('');
  const [selectedPrompts, setSelectedPrompts] = useState<{ prompt_id: string, text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasQuestionnaire, setHasQuestionnaire] = useState(true);

  useEffect(() => {
    if (!user) return;
    console.log('DateProfileSetup: Loading profile for', user.id);
    getDateProfile(user.id).then(profile => {
      console.log('DateProfileSetup: Loaded profile', profile);
      if (profile) {
        // If profile is already active, don't show setup unless explicitly editing
        if (profile.status === 'active' || profile.status === 'paused') {
          console.log('DateProfileSetup: Profile is already active, redirecting to feed');
          navigation.replace('DateFeed');
          return;
        }

        setPhotos(profile.photos || []);
        setBio(profile.bio || '');
        setSelectedPrompts(profile.prompts?.map(p => ({ prompt_id: p.prompt_id, text: p.text })) || []);
      }
    }).catch(err => console.error('DateProfileSetup: Load profile error', err));

    getQuestionnaireAnswers(user.id).then(answers => {
      setHasQuestionnaire(answers.length > 0);
    }).catch(err => console.error('DateProfileSetup: Load quiz error', err));
  }, [user]);

  const handleNext = () => {
    console.log('DateProfileSetup: handleNext', { step });
    if (step < 3) {
      setStep(step + 1);
    } else {
      finalize();
    }
  };

  const pickImage = async () => {
    if (!user) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      const { data, error } = await uploadDatePhoto(user.id, {
        uri: result.assets[0].uri,
        name: result.assets[0].fileName || 'photo.jpg',
        mimeType: result.assets[0].mimeType || 'image/jpeg',
        size: result.assets[0].fileSize
      }, photos.length);
      setUploading(false);

      if (data) {
        setPhotos([...photos, data]);
      } else if (error) {
        Alert.alert('Error', error);
      }
    }
  };

  const finalize = async () => {
    console.log('DateProfileSetup: Starting finalize...', { 
      userId: user?.id, 
      bio, 
      promptCount: selectedPrompts.length,
      userObject: {
        display_name: user?.display_name,
        iit: user?.iit,
        gender: user?.gender,
        year: user?.year
      }
    });

    if (!user) {
      alert('You must be logged in to complete your profile.');
      return;
    }

    setLoading(true);

    try {
      // 1. Save Prompts
      console.log('DateProfileSetup: Saving prompts...');
      const { error: promptError } = await savePromptAnswers(user.id, selectedPrompts.map((p, i) => ({ ...p, position: i })));
      if (promptError) {
        console.error('DateProfileSetup: Error saving prompts:', promptError);
        alert('Failed to save prompts: ' + promptError);
        setLoading(false);
        return;
      }

      // 2. Update Profile
      // Normalize enums to lowercase as required by DB
      const profilePatch = {
        display_name: user.display_name || 'Anonymous',
        iit: (user.iit || 'iitb').toLowerCase() as any,
        branch: user.branch || 'unknown',
        year: user.year || '2026',
        gender: (user.gender || 'other').toLowerCase() as any,
        bio,
        status: 'active' as const
      };
      
      console.log('DateProfileSetup: Updating profile with patch:', profilePatch);
      const { error: profileError } = await updateDateProfile(user.id, profilePatch);

      if (profileError) {
        console.error('DateProfileSetup: Error updating profile:', profileError);
        alert('Failed to update profile: ' + profileError);
        setLoading(false);
        return;
      }

      console.log('DateProfileSetup: Profile finalized successfully');
      setLoading(false);
      
      // Navigate to feed
      navigation.reset({
        index: 0,
        routes: [{ name: 'DateFeed' }],
      });
    } catch (err) {
      console.error('DateProfileSetup: Unexpected error in finalize:', err);
      alert('An unexpected error occurred: ' + (err instanceof Error ? err.message : String(err)));
      setLoading(false);
    }
  };

  const addPrompt = (p: string) => {
    if (selectedPrompts.length >= 3) return;
    setSelectedPrompts([...selectedPrompts, { prompt_id: p, text: '' }]);
  };

  const updatePromptText = (idx: number, text: string) => {
    const next = [...selectedPrompts];
    next[idx].text = text;
    setSelectedPrompts(next);
  };

  const removePrompt = (idx: number) => {
    const next = [...selectedPrompts];
    next.splice(idx, 1);
    setSelectedPrompts(next);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Build your profile</Text>
        <Text style={styles.stepIndicator}>Step {step} of 3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 1 && (
          <View>
            <Text style={styles.title}>Add photos</Text>
            <Text style={styles.subtitle}>Upload 1–4 photos. The first one is your hero.</Text>
            
            <View style={styles.photoGrid}>
              {photos.map((p, i) => (
                <View key={p.id} style={styles.photoWrapper}>
                  <Image source={{ uri: p.url }} style={styles.photo} />
                  {i === 0 && <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>HERO</Text></View>}
                </View>
              ))}
              {photos.length < 4 && (
                <TouchableOpacity 
                  style={styles.addPhoto} 
                  onPress={pickImage}
                  disabled={uploading}
                >
                  {uploading ? <ActivityIndicator color={colors.inkMute} /> : <Icon name="plus" size={24} color={colors.inkMute} />}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.title}>Your bio</Text>
            <Text style={styles.subtitle}>A sentence or two about you. No pressure.</Text>
            <TextInput
              style={styles.bioInput}
              placeholder="Start writing..."
              multiline
              maxLength={150}
              value={bio}
              onChangeText={setBio}
              autoFocus
            />
            <Text style={styles.limit}>{bio.length}/150</Text>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.title}>Prompts</Text>
            <Text style={styles.subtitle}>Must answer at least 2. These are great icebreakers.</Text>

            <View style={{ gap: 24, marginBottom: 40 }}>
              {selectedPrompts.map((p, i) => (
                <View key={i} style={styles.promptCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={styles.promptLabel}>{p.prompt_id}</Text>
                    <TouchableOpacity onPress={() => removePrompt(i)} hitSlop={12}>
                      <Icon name="x" size={16} color={colors.inkWhisper} />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.promptInput}
                    placeholder="Your answer..."
                    value={p.text}
                    onChangeText={(t) => updatePromptText(i, t)}
                    maxLength={120}
                    autoFocus={i === selectedPrompts.length - 1}
                  />
                  <Text style={styles.promptLimit}>{p.text.length}/120</Text>
                </View>
              ))}
            </View>

            {selectedPrompts.length < 3 && (
              <View>
                <Text style={styles.optionTitle}>Choose a prompt:</Text>
                <View style={styles.optionGrid}>
                  {PROMPT_OPTIONS.filter(o => !selectedPrompts.find(sp => sp.prompt_id === o)).map((o, i) => (
                    <TouchableOpacity key={i} style={styles.option} onPress={() => addPrompt(o)}>
                      <Text style={styles.optionText}>{o}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {!hasQuestionnaire && (
          <TouchableOpacity 
            style={styles.quizNudge}
            onPress={() => navigation.navigate('DateQuestionnaire', { step: 1 })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.quizNudgeTitle}>Improve your matches</Text>
              <Text style={styles.quizNudgeBody}>Answer 13 quick questions about how you think and live.</Text>
            </View>
            <Icon name="chevronRight" size={20} color={colors.inkWhisper} />
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Button 
          title={loading ? "Saving..." : step === 3 ? "Complete profile" : "Next"} 
          onPress={handleNext}
          disabled={loading || (step === 1 && photos.length === 0) || (step === 3 && selectedPrompts.length < 2)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontFamily: fonts.label, fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.4, color: colors.inkWhisper },
  stepIndicator: { fontFamily: fonts.label, fontSize: 10, textTransform: 'uppercase', color: colors.inkMute },
  content: { padding: 24 },
  title: { fontFamily: fonts.serif, fontSize: 32, color: colors.ink, marginBottom: 8 },
  subtitle: { fontFamily: fonts.body, fontSize: 16, color: colors.inkMute, marginBottom: 32 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  photoWrapper: { width: '47%', aspectRatio: 4/5, backgroundColor: colors.khadiDeep, position: 'relative' },
  photo: { width: '100%', height: '100%' },
  heroBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: colors.ink, paddingHorizontal: 6, paddingVertical: 2 },
  heroBadgeText: { fontFamily: fonts.label, fontSize: 8, color: colors.khadi, letterSpacing: 1 },
  addPhoto: { width: '47%', aspectRatio: 4/5, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.hairline, alignItems: 'center', justifyContent: 'center' },
  bioInput: { fontFamily: fonts.body, fontSize: 20, color: colors.ink, lineHeight: 28, minHeight: 120, textAlignVertical: 'top' },
  limit: { fontFamily: fonts.label, fontSize: 10, color: colors.inkWhisper, textAlign: 'right', marginTop: 12 },
  promptCard: { borderBottomWidth: 1, borderBottomColor: colors.hairlineSoft, paddingBottom: 16 },
  promptLabel: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.inkWhisper },
  promptInput: { fontFamily: fonts.body, fontSize: 18, color: colors.ink },
  promptLimit: { fontFamily: fonts.label, fontSize: 9, color: colors.inkWhisper, textAlign: 'right', marginTop: 8 },
  optionTitle: { fontFamily: fonts.label, fontSize: 11, color: colors.inkWhisper, textTransform: 'uppercase', marginBottom: 16 },
  optionGrid: { gap: 8 },
  option: { padding: 12, borderWidth: 1, borderColor: colors.hairlineSoft },
  optionText: { fontFamily: fonts.body, fontSize: 15, color: colors.inkMute },
  quizNudge: { 
    marginTop: 48, 
    padding: 20, 
    backgroundColor: colors.khadiLight, 
    borderWidth: 1, 
    borderColor: colors.hairlineSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  quizNudgeTitle: { fontFamily: fonts.serif, fontSize: 18, color: colors.ink, marginBottom: 4 },
  quizNudgeBody: { fontFamily: fonts.body, fontSize: 14, color: colors.inkMute, lineHeight: 20 },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: colors.hairlineSoft }
});
