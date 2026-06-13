import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IntroStackParamList, Introduction } from '@/types';
import { colors, fonts } from '@/tokens';
import { useAuth } from '@/context/AuthContext';
import { useMyPublicIntroduction, useUpsertPublicIntroduction } from '@/hooks/useIntroductions';
import { Icon } from '@/components/Icon';
import * as ImagePicker from 'expo-image-picker';
import { uploadProfilePhoto } from '@/lib/supabase';

export function CreateIntroScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<IntroStackParamList>>();
  const { user } = useAuth();
  const { data: existingIntro, isLoading: loadingIntro } = useMyPublicIntroduction();
  const upsertMutation = useUpsertPublicIntroduction();

  const [photoUrl, setPhotoUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [hometown, setHometown] = useState('');
  const [oneLiner, setOneLiner] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [question, setQuestion] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedIit, setSelectedIit] = useState<string>('');

  const IIT_OPTIONS = ['IITB', 'IITK', 'IITD', 'IITM', 'IITR', 'IITG', 'IITH', 'IITKGP'];

  useEffect(() => {
    if (existingIntro) {
      setPhotoUrl(existingIntro.photo_url);
      setDisplayName(existingIntro.display_name);
      setHometown(existingIntro.hometown);
      setOneLiner(existingIntro.one_liner);
      setInterests(existingIntro.interests || []);
      setQuestion(existingIntro.question || '');
      setSelectedIit(existingIntro.iit.toUpperCase());
    } else if (user) {
      setPhotoUrl(user.photo_url || '');
      setDisplayName(user.display_name || '');
      setHometown(user.hometown || '');
      setSelectedIit(user.iit?.toUpperCase() || 'IITB');
    }
  }, [existingIntro, user]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploading(true);
      try {
        const asset = {
          uri: result.assets[0].uri,
          name: result.assets[0].fileName || `intro-${Date.now()}.jpg`,
          mimeType: result.assets[0].mimeType || 'image/jpeg',
          size: result.assets[0].fileSize,
        };
        const { user: updatedUser, error } = await uploadProfilePhoto(asset);
        if (error) throw new Error(error);
        if (updatedUser?.photo_url) {
          setPhotoUrl(updatedUser.photo_url);
        }
      } catch (err: any) {
        Alert.alert('Upload failed', err.message);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const addInterest = () => {
    if (interestInput.trim() && interests.length < 3) {
      setInterests([...interests, interestInput.trim().slice(0, 20)]);
      setInterestInput('');
    }
  };

  const removeInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!photoUrl || !displayName || !hometown || !oneLiner || !selectedIit) {
      Alert.alert('Missing fields', 'Please fill in all required fields (Photo, Name, IIT, Hometown, and One-liner).');
      return;
    }

    const introData: Partial<Introduction> = {
      display_name: displayName,
      photo_url: photoUrl,
      hometown,
      one_liner: oneLiner,
      interests,
      question: question || null,
      status: 'posted',
      iit: selectedIit.toLowerCase(),
      branch: user?.branch || 'Unknown',
    };

    upsertMutation.mutate(introData, {
      onSuccess: () => {
        Alert.alert('Success', 'Your introduction has been posted!');
        navigation.navigate('IntroFeed');
      },
      onError: (err: any) => {
        Alert.alert('Error', err.message || 'Failed to post introduction.');
      }
    });
  };

  if (loadingIntro) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.khadi, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.hairlineSoft }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Icon name="chevronLeft" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={{ fontFamily: fonts.label, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.4, color: colors.ink, marginLeft: 8 }}>
          {existingIntro ? 'Edit Introduction' : 'Introduce Yourself'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60, gap: 24 }}>
        <View>
          <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: colors.ink, marginBottom: 8 }}>
            Your Public Intro
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.inkMute }}>
            One post. Your whole batch will see it.
          </Text>
        </View>

        {/* Photo Picker */}
        <TouchableOpacity
          onPress={pickImage}
          activeOpacity={0.85}
          style={{
            width: 120,
            height: 120,
            alignSelf: 'center',
            backgroundColor: colors.khadiLight,
            borderWidth: 1,
            borderColor: colors.hairline,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={{ width: 120, height: 120 }} />
          ) : (
            <Icon name="upload" size={32} color={colors.inkWhisper} />
          )}
          {isUploading && (
            <View style={{ ...StyleSheet.absoluteFill, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={colors.ink} />
            </View>
          )}
        </TouchableOpacity>

        {/* Fields */}
        <View style={{ gap: 20 }}>
          <View>
            <Text style={styles.label}>Display Name *</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
            />
          </View>

          <View>
            <Text style={styles.label}>IIT *</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {IIT_OPTIONS.map((iit) => (
                <TouchableOpacity
                  key={iit}
                  onPress={() => setSelectedIit(iit)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderWidth: 1,
                    borderColor: selectedIit === iit ? colors.ink : colors.hairline,
                    backgroundColor: selectedIit === iit ? colors.ink : 'transparent',
                  }}
                >
                  <Text style={{
                    fontFamily: fonts.label,
                    fontSize: 10,
                    color: selectedIit === iit ? colors.khadi : colors.inkMute,
                    textTransform: 'uppercase',
                  }}>
                    {iit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.label}>Hometown *</Text>
            <TextInput
              style={styles.input}
              value={hometown}
              onChangeText={setHometown}
              placeholder="e.g. Mumbai, Maharashtra"
              maxLength={40}
            />
          </View>

          <View>
            <Text style={styles.label}>One-liner * (max 120 chars)</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
              value={oneLiner}
              onChangeText={setOneLiner}
              placeholder="The one thing about you that doesn't fit in a résumé."
              multiline
              maxLength={120}
            />
            <Text style={styles.counter}>{oneLiner.length}/120</Text>
          </View>

          <View>
            <Text style={styles.label}>Interests (max 3)</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={interestInput}
                onChangeText={setInterestInput}
                placeholder="e.g. Astrophysics"
                maxLength={20}
                onSubmitEditing={addInterest}
              />
              <TouchableOpacity
                onPress={addInterest}
                disabled={interests.length >= 3 || !interestInput.trim()}
                style={{
                  paddingHorizontal: 16,
                  backgroundColor: colors.ink,
                  justifyContent: 'center',
                  opacity: (interests.length >= 3 || !interestInput.trim()) ? 0.5 : 1
                }}
              >
                <Text style={{ fontFamily: fonts.label, fontSize: 10, color: colors.khadi, textTransform: 'uppercase' }}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {interests.map((it, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => removeInterest(idx)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderWidth: 1,
                    borderColor: colors.hairline,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Text style={{ fontFamily: fonts.label, fontSize: 10, color: colors.inkMute, textTransform: 'uppercase' }}>{it}</Text>
                  <Icon name="x" size={12} color={colors.inkWhisper} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.label}>A question for seniors (optional)</Text>
            <TextInput
              style={[styles.input, { height: 60, textAlignVertical: 'top', paddingTop: 12 }]}
              value={question}
              onChangeText={setQuestion}
              placeholder="Something you're curious about..."
              multiline
              maxLength={100}
            />
            <Text style={styles.counter}>{question.length}/100</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handlePost}
          disabled={upsertMutation.isPending}
          style={{
            height: 56,
            backgroundColor: colors.ink,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 12,
            marginBottom: 40,
          }}
        >
          {upsertMutation.isPending ? (
            <ActivityIndicator color={colors.khadi} />
          ) : (
            <Text style={{ fontFamily: fonts.label, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 2, color: colors.khadi }}>
              Post Introduction
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.label,
    fontSize: 10.5,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: colors.inkMute,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.khadiLight,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: 16,
    height: 48,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
  },
  counter: {
    fontFamily: fonts.label,
    fontSize: 9,
    color: colors.inkWhisper,
    textAlign: 'right',
    marginTop: 4,
  }
});
