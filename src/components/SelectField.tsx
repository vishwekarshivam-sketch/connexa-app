import { View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors, fonts } from '@/tokens';
import { Eyebrow } from '@/components/Eyebrow';

interface Option { 
  label: string; 
  value: string; 
}

interface Props {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
}

export function SelectField({ label, value, onChange, options, placeholder }: Props) {
  return (
    <View>
      {label && <Eyebrow style={{ marginBottom: 12 }}>{label}</Eyebrow>}
      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.hairline }}>
        <Picker
          selectedValue={value}
          onValueChange={(v) => onChange(v as string)}
          style={{ 
            fontFamily: fonts.body, 
            fontSize: 17, 
            color: value ? colors.ink : colors.inkWhisper 
          }}
        >
          {placeholder && <Picker.Item label={placeholder} value="" color={colors.inkWhisper} />}
          {options.map((o) => (
            <Picker.Item key={o.value} label={o.label} value={o.value} color={colors.ink} />
          ))}
        </Picker>
      </View>
    </View>
  );
}
