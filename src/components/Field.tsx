import { useState } from 'react';
import { View, TextInput, Text, ViewStyle, Platform } from 'react-native';
import { colors, fonts } from '@/tokens';
import { Eyebrow } from '@/components/Eyebrow';
import { Icon } from '@/components/Icon';

interface Props {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'default' | 'email-address' | 'numeric';
  error?: string;
  autoFocus?: boolean;
  maxLength?: number;
  style?: ViewStyle;
}

export function Field({ label, value, onChange, placeholder, type = 'default', error, autoFocus, maxLength, style }: Props) {
  const [focus, setFocus] = useState(false);
  const ruleColor = error ? colors.ember : focus ? colors.ember : colors.hairline;
  const ruleWidth = focus || error ? 2 : 1;

  return (
    <View style={style}>
      {label && <Eyebrow style={{ marginBottom: 12 }}>{label}</Eyebrow>}
      <View style={{ borderBottomWidth: ruleWidth, borderBottomColor: ruleColor, paddingBottom: 10 }}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.inkWhisper}
          keyboardType={type}
          autoFocus={autoFocus}
          maxLength={maxLength}
          autoCapitalize="none"
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={[
            {
              fontFamily: fonts.body,
              fontSize: 17,
              color: colors.ink,
              letterSpacing: 0.09,
              padding: 0,
            },
            // RN-web renders TextInput as <input>; kill the browser focus outline.
            Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
          ]}
        />
      </View>
      {!!error && (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginTop: 10 }}>
          <Icon name="lamp" size={15} color={colors.ember} />
          <Text style={{ fontFamily: fonts.body, fontStyle: 'italic', fontSize: 13.5, color: colors.ember, lineHeight: 20, flex: 1 }}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );
}
