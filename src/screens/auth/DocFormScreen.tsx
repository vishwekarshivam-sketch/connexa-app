import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { IITS } from '@/fixtures/constants';
import { submitDocForm } from '@/lib/supabase';
import { colors, fonts } from '@/tokens';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { Title } from '@/components/Title';
import { Body } from '@/components/Body';
import { Field } from '@/components/Field';
import { SelectField } from '@/components/SelectField';
import { Button } from '@/components/Button';
import { Eyebrow } from '@/components/Eyebrow';
import { Icon } from '@/components/Icon';

type Props = NativeStackScreenProps<AuthStackParamList, 'DocForm'>;

interface Errs { 
  email?: string;
  roll?: string; 
  name?: string; 
  iit?: string; 
  file?: string; 
}

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const DOCUMENT_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp', 'heic', 'heif']);

export function DocFormScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [roll, setRoll] = useState('');
  const [name, setName] = useState('');
  const [iit, setIit] = useState('');
  const [file, setFile] = useState<{ name: string; uri: string; mimeType: string; size?: number | null } | null>(null);
  const [errs, setErrs] = useState<Errs>({});
  const [submitting, setSubmitting] = useState(false);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const filename = asset.name || asset.uri.split('/').pop() || 'document';
      const ext = filename.includes('.') ? filename.split('.').pop()?.toLowerCase() : undefined;
      if (ext && !DOCUMENT_EXTENSIONS.has(ext)) {
        setErrs((e) => ({ ...e, file: 'Attach a PDF, JPG, PNG, WEBP, or HEIC file.' }));
        return;
      }
      if (asset.size && asset.size > MAX_UPLOAD_BYTES) {
        setErrs((e) => ({ ...e, file: 'Attach a file under 10MB.' }));
        return;
      }
      setFile({
        name: filename,
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'application/octet-stream',
        size: asset.size,
      });
      setErrs((e) => ({ ...e, file: undefined }));
    }
  };

  const submit = async () => {
    const e: Errs = {};
    const contactEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) e.email = 'Enter an email where we can send your approval link.';
    if (!/^\d{7,8}$/.test(roll.trim())) e.roll = 'Seven or eight digits, numbers only.';
    if (!name.trim()) e.name = 'Enter your full name as on the document.';
    else if (/\d/.test(name)) e.name = "Name shouldn't contain numbers.";
    if (!iit) e.iit = 'Choose the IIT you\'re joining.';
    if (!file) e.file = 'Attach your allotment letter or result sheet.';
    setErrs(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    const result = await submitDocForm({
      contactEmail,
      roll: roll.trim(),
      name: name.trim(),
      iit,
      asset: file!,
    });
    setSubmitting(false);
    if (result.error) {
      setErrs((prev) => ({ ...prev, file: result.error ?? undefined }));
      return;
    }

    const iitLabel = IITS.find((x) => x.value === iit)?.label ?? iit;
    navigation.navigate('Pending', { 
      email: contactEmail,
      displayName: name.trim(), 
      iitLabel, 
      roll: roll.trim() 
    });
  };

  return (
    <Screen scrollable footer={<Button onPress={submit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit for review'}</Button>}>
      <TopBar onBack={navigation.goBack}>
        <Eyebrow>Verify · Documents</Eyebrow>
      </TopBar>
      <View style={{ paddingTop: 24, marginBottom: 30 }}>
        <Title size={32} style={{ marginBottom: 14 }}>Your JEE Advanced details.</Title>
        <Body size={15}>Reviewed by a person, not a machine. Usually within a few hours.</Body>
      </View>
      <View style={{ gap: 30 }}>
        <Field
          label="Contact email"
          value={email}
          placeholder="you@example.com"
          type="email-address"
          error={errs.email}
          onChange={(v) => {
            setEmail(v);
            if (errs.email) setErrs((e) => ({ ...e, email: undefined }));
          }}
        />
        <Field
          label="JEE Advanced roll number"
          value={roll}
          placeholder="12345678"
          type="numeric"
          error={errs.roll}
          onChange={(v) => { 
            setRoll(v.replace(/\D/g, '')); 
            if (errs.roll) setErrs((e) => ({ ...e, roll: undefined })); 
          }}
        />
        <Field
          label="Full name (as on document)"
          value={name}
          placeholder="Your name"
          error={errs.name}
          onChange={(v) => { 
            setName(v); 
            if (errs.name) setErrs((e) => ({ ...e, name: undefined })); 
          }}
        />
        <SelectField
          label="Which IIT are you joining?"
          value={iit}
          placeholder="Select your IIT"
          options={IITS}
          onChange={(v) => { 
            setIit(v); 
            if (errs.iit) setErrs((e) => ({ ...e, iit: undefined })); 
          }}
        />
        {errs.iit && (
          <Text style={{ 
            marginTop: -20, 
            fontFamily: fonts.bodyItalic, 
            fontStyle: 'italic', 
            fontSize: 13.5, 
            color: colors.ember 
          }}>
            {errs.iit}
          </Text>
        )}
        <View>
          <Eyebrow style={{ marginBottom: 12 }}>Allotment letter or result sheet</Eyebrow>
          <TouchableOpacity
            onPress={pickFile}
            activeOpacity={0.85}
            style={{
              backgroundColor: colors.khadiLight,
              borderWidth: 1,
              borderStyle: file ? 'solid' : 'dashed',
              borderColor: file ? colors.ink : colors.hairline,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <Icon name={file ? 'check' : 'upload'} size={24} color={file ? colors.lichen : colors.inkMute} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.body, fontSize: 15.5, color: colors.ink }} numberOfLines={1}>
                {file ? file.name : 'Attach a file'}
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.inkWhisper, marginTop: 3 }}>
                {file ? 'attached' : 'PDF, JPG, PNG, WEBP, or HEIC · under 10MB'}
              </Text>
            </View>
          </TouchableOpacity>
          {errs.file && (
            <View style={{ flexDirection: 'row', gap: 7, marginTop: 10 }}>
              <Icon name="lamp" size={15} color={colors.ember} />
              <Text style={{ 
                fontFamily: fonts.bodyItalic, 
                fontStyle: 'italic', 
                fontSize: 13.5, 
                color: colors.ember 
              }}>
                {errs.file}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
}
