import { useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { colors, fonts } from '../tokens';

interface Props { 
  value: string; 
  onChange: (v: string) => void; 
  length?: number;
}

export function OtpInput({ value, onChange, length = 6 }: Props) {
  const ref = useRef<TextInput>(null);
  const [focus, setFocus] = useState(false);
  const active = Math.min(value.length, length - 1);

  return (
    <TouchableOpacity activeOpacity={1} onPress={() => ref.current?.focus()}>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        keyboardType="numeric"
        maxLength={length}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
      />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {Array.from({ length }).map((_, i) => {
          const isActive = focus && i === active;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: 64,
                alignItems: 'center',
                justifyContent: 'center',
                borderBottomWidth: isActive || value[i] ? 2 : 1,
                borderBottomColor: isActive ? colors.ember : value[i] ? colors.ink : colors.hairline,
              }}
            >
              <Text style={{ fontFamily: fonts.serif, fontSize: 32, color: colors.ink }}>
                {value[i] || ''}
              </Text>
            </View>
          );
        })}
      </View>
    </TouchableOpacity>
  );
}
