import { useState } from 'react';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { colors, fonts } from '@/tokens';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { StepProgress } from '@/components/StepProgress';
import { Title } from '@/components/Title';
import { Body } from '@/components/Body';
import { Button } from '@/components/Button';
import { uploadProfilePhoto } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfilePhoto'>;

export function PhotoStep({ navigation }: Props) {
  const { setUser } = useAuth();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPhotoUri(asset.uri);
      setSaving(true);
      const upload = await uploadProfilePhoto({
        uri: asset.uri,
        name: asset.fileName ?? asset.uri.split('/').pop() ?? 'profile.jpg',
        mimeType: asset.mimeType ?? 'image/jpeg',
        size: asset.fileSize,
      });
      setSaving(false);
      if (upload.error) {
        setErr(upload.error);
        return;
      }
      if (upload.user) setUser(upload.user);
    }
  };

  const next = () => navigation.navigate('ProfileGender');

  return (
    <Screen footer={
      <View style={{ gap: 14 }}>
        <Button onPress={next} disabled={saving}>{saving ? 'Uploading...' : 'Continue'}</Button>
        <Button variant="text" onPress={next} full>Skip for now</Button>
      </View>
    }>
      <TopBar onBack={navigation.goBack}>
        <StepProgress step={2} total={4} />
      </TopBar>
      <View style={{ paddingTop: 30, flex: 1 }}>
        <Title size={34} style={{ marginBottom: 14 }}>One photo of you.</Title>
        <Body style={{ marginBottom: 38 }}>Just one. Tap to choose. We'll crop it square.</Body>
        {!!err && (
          <Text style={{ fontFamily: fonts.body, fontStyle: 'italic', fontSize: 13.5, color: colors.ember, marginBottom: 18 }}>
            {err}
          </Text>
        )}
        <View style={{ alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={pick} activeOpacity={0.85}>
            <View style={{ 
              width: 208, 
              height: 208, 
              borderWidth: 1, 
              borderColor: colors.hairline, 
              backgroundColor: colors.khadiLight, 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              {photoUri
                ? <Image source={{ uri: photoUri }} style={{ width: 208, height: 208 }} />
                : (
                  <Text style={{ 
                    fontFamily: fonts.body, 
                    fontStyle: 'italic', 
                    fontSize: 14, 
                    color: colors.inkWhisper 
                  }}>
                    Tap to add photo
                  </Text>
                )
              }
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}
