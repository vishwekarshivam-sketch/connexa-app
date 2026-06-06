import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DateStackParamList, ProfilePhoto } from '@/types';
import { colors, fonts } from '@/tokens';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { uploadDatePhoto, updateDateProfile, savePromptAnswers, getDateProfile } from '@/lib/supabase';
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

export function DateProfileSetupScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [bio, setBio] = useState('');
  const [selectedPrompts, setSelectedPrompts] = useState<{ prompt_id: string, text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDateProfile(user.id).then(profile => {
      if (profile) {
        setPhotos(profile.photos || []);
        setBio(profile.bio || '');
        setSelectedPrompts(profile.prompts?.map(p => ({ prompt_id: p.prompt_id, text: p.text })) || []);
      }
    });
  }, [user]);

  const handleNext = () => {
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
    if (!user) return;
    setLoading(true);

    const { error: promptError } = await savePromptAnswers(user.id, selectedPrompts.map((p, i) => ({ ...p, position: i })));
    if (promptError) {
      Alert.alert('Error', promptError);
      setLoading(false);
      return;
    }

    const { error: profileError } = await updateDateProfile(user.id, {
      display_name: user.display_name || 'Anonymous',
      iit: user.iit || 'iitb',
      branch: user.branch || 'unknown',
      year: Number(user.year ?? 2026),
      gender: user.gender || 'other',
      bio,
      status: 'active'
    });

    setLoading(false);

    if (profileError) {
      Alert.alert('Error', profileError);
      return;
    }

    navigation.replace('DateFeed');
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
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: colors.hairlineSoft }
});
