import { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Gender, ProfileStackParamList } from '@/types';
import { colors, fonts, houseColors } from '@/tokens';
import { HOUSES } from '@/fixtures/houseData';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { uploadProfilePhoto } from '@/lib/supabase';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Man' },
  { value: 'female', label: 'Woman' },
  { value: 'other', label: 'Prefer not to say' },
];

export function EditProfileScreen({ navigation }: Props) {
  const { user, updateUser, setUser } = useAuth();
  const houseKey = user?.house ?? 'tinkerers';
  const house = HOUSES[houseKey];

  const [name, setName] = useState(user?.display_name ?? '');
  const [hometown, setHometown] = useState(user?.hometown ?? '');
  const [gender, setGender] = useState<Gender>(user?.gender ?? 'other');
  const [photoUri, setPhotoUri] = useState<string | null>(user?.photo_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const dirty =
    name !== (user?.display_name ?? '') ||
    hometown !== (user?.hometown ?? '') ||
    gender !== (user?.gender ?? 'other');

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setPhotoUri(asset.uri);
    setUploading(true);
    const upload = await uploadProfilePhoto({
      uri: asset.uri,
      name: asset.fileName ?? asset.uri.split('/').pop() ?? 'profile.jpg',
      mimeType: asset.mimeType ?? 'image/jpeg',
      size: asset.fileSize,
    });
    setUploading(false);
    if (upload.error) { setErr(upload.error); return; }
    if (upload.user) setUser(upload.user);
  };

  const save = async () => {
    if (!name.trim()) { setErr('Display name cannot be empty.'); return; }
    setSaving(true);
    const { error } = await updateUser({
      display_name: name.trim(),
      hometown: hometown.trim() || null,
      gender,
    });
    setSaving(false);
    if (error) { setErr(error); return; }
    navigation.goBack();
  };

  return (
    <Screen
      scrollable
      footer={
        <Button onPress={save} disabled={!dirty || saving || uploading}>
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
      }
    >
      <TopBar onBack={navigation.goBack} />

      {/* Photo */}
      <View style={{ alignItems: 'center', paddingTop: 16, marginBottom: 32 }}>
        <TouchableOpacity onPress={pickPhoto} activeOpacity={0.85}>
          <View style={{
            width: 104,
            height: 104,
            borderWidth: 1,
            borderColor: colors.hairline,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={{ width: 104, height: 104 }} />
            ) : (
              <Text style={{ fontFamily: fonts.bodyItalic, fontStyle: 'italic', fontSize: 13, color: colors.inkWhisper }}>
                Tap to add
              </Text>
            )}
          </View>
          {uploading && (
            <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.inkWhisper, marginTop: 6, textAlign: 'center' }}>
              Uploading…
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Editable fields */}
      <Field
        label="Display name"
        value={name}
        onChange={(v) => { setName(v); if (err) setErr(''); }}
        placeholder="Your name"
        maxLength={60}
        style={{ marginBottom: 28 }}
      />
      <Field
        label="Hometown"
        value={hometown}
        onChange={setHometown}
        placeholder="City, State"
        maxLength={40}
        style={{ marginBottom: 28 }}
      />

      {/* Gender */}
      <Text style={{
        fontFamily: fonts.label,
        fontSize: 10.5,
        textTransform: 'uppercase',
        letterSpacing: 1.68,
        color: colors.inkMute,
        marginBottom: 14,
      }}>
        Gender
      </Text>
      <View style={{ gap: 10, marginBottom: 32 }}>
        {GENDER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            activeOpacity={0.85}
            onPress={() => setGender(opt.value)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: gender === opt.value ? colors.ink : colors.hairline,
              backgroundColor: gender === opt.value ? colors.ink : 'transparent',
            }}
          >
            <Text style={{
              fontFamily: fonts.body,
              fontSize: 15,
              color: gender === opt.value ? colors.khadi : colors.ink,
            }}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Read-only chips */}
      <Text style={{
        fontFamily: fonts.label,
        fontSize: 10.5,
        textTransform: 'uppercase',
        letterSpacing: 1.68,
        color: colors.inkWhisper,
        marginBottom: 10,
      }}>
        Fixed (from verification)
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {[user?.iit, user?.branch, house.nameEn].filter(Boolean).map((c) => (
          <View key={c} style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: colors.hairlineSoft,
          }}>
            <Text style={{
              fontFamily: fonts.label,
              fontSize: 10.5,
              textTransform: 'uppercase',
              letterSpacing: 1.4,
              color: colors.inkWhisper,
            }}>
              {c}
            </Text>
          </View>
        ))}
      </View>

      {!!err && (
        <Text style={{ fontFamily: fonts.bodyItalic, fontStyle: 'italic', fontSize: 13.5, color: colors.ember, marginBottom: 16 }}>
          {err}
        </Text>
      )}
    </Screen>
  );
}
