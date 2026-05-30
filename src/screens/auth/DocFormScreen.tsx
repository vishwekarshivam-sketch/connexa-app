import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types';
import { IITS } from '@/fixtures/constants';
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
  roll?: string; 
  name?: string; 
  iit?: string; 
  file?: string; 
}

export function DocFormScreen({ navigation }: Props) {
  const [roll, setRoll] = useState('');
  const [name, setName] = useState('');
  const [iit, setIit] = useState('');
  const [file, setFile] = useState<{ name: string; uri: string } | null>(null);
  const [errs, setErrs] = useState<Errs>({});

  const pickFile = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const filename = asset.uri.split('/').pop() ?? 'document';
      setFile({ name: filename, uri: asset.uri });
      setErrs((e) => ({ ...e, file: undefined }));
    }
  };

  const submit = () => {
    const e: Errs = {};
    if (!/^\d{7,8}$/.test(roll.trim())) e.roll = 'Seven or eight digits, numbers only.';
    if (!name.trim()) e.name = 'Enter your full name as on the document.';
    else if (/\d/.test(name)) e.name = "Name shouldn't contain numbers.";
    if (!iit) e.iit = 'Choose the IIT you\'re joining.';
    if (!file) e.file = 'Attach your allotment letter or result sheet.';
    setErrs(e);
    if (Object.keys(e).length) return;

    const iitLabel = IITS.find((x) => x.value === iit)?.label ?? iit;
    navigation.navigate('Pending', { 
      displayName: name.trim(), 
      iitLabel, 
      roll: roll.trim() 
    });
  };

  return (
    <Screen scrollable footer={<Button onPress={submit}>Submit for review</Button>}>
      <TopBar onBack={navigation.goBack}>
        <Eyebrow>Verify · Documents</Eyebrow>
      </TopBar>
      <View style={{ paddingTop: 24, marginBottom: 30 }}>
        <Title size={32} style={{ marginBottom: 14 }}>Your JEE Advanced details.</Title>
        <Body size={15}>Reviewed by a person, not a machine. Usually within a few hours.</Body>
      </View>
      <View style={{ gap: 30 }}>
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
            fontFamily: fonts.body, 
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
                {file ? 'attached' : 'PDF, JPG or PNG · under 10MB'}
              </Text>
            </View>
          </TouchableOpacity>
          {errs.file && (
            <View style={{ flexDirection: 'row', gap: 7, marginTop: 10 }}>
              <Icon name="lamp" size={15} color={colors.ember} />
              <Text style={{ 
                fontFamily: fonts.body, 
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
