import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DateStackParamList } from '@/types';
import { colors, fonts } from '@/tokens';
import { Icon } from '@/components/Icon';

type Props = NativeStackScreenProps<DateStackParamList, 'DateSettings'>;

export function DateSettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const Row = ({ label, value, onPress, isSwitch, toggleValue, onToggle }: any) => (
    <TouchableOpacity 
      style={styles.row} 
      onPress={onPress} 
      disabled={isSwitch}
      activeOpacity={0.7}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {isSwitch && (
        <Switch 
          value={toggleValue} 
          onValueChange={onToggle} 
          trackColor={{ true: colors.ink, false: colors.hairline }}
          thumbColor={colors.khadi}
        />
      )}
      {!isSwitch && (
        <View style={{ transform: [{ rotate: '180deg' }] }}>
          <Icon name="chevronLeft" size={16} color={colors.hairline} />
        </View>
      )}
    </TouchableOpacity>
  );

  const Section = ({ title, children }: any) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.khadi, paddingTop: insets.top }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Icon name="chevronLeft" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Date Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Section title="Profile">
          <Row label="Edit Date profile" onPress={() => navigation.navigate('DateProfileSetup', { step: 1 })} />
          <Row label="Preview how I look" onPress={() => {}} />
        </Section>

        <Section title="Matches & Interests">
          <Row label="My interests" onPress={() => navigation.navigate('DateInterests')} />
          <Row label="My matches" onPress={() => navigation.navigate('DateMatches')} />
          <Row label="Matching preferences" onPress={() => navigation.navigate('DateQuestionnaire', { step: 1 })} />
        </Section>

        <Section title="Privacy">
          <Row label="Pause my profile" isSwitch toggleValue={false} onToggle={() => {}} />
          <Row label="People I've hidden" onPress={() => {}} />
        </Section>

        <Section title="Notifications">
          <Row label="New matches" isSwitch toggleValue={true} onToggle={() => {}} />
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft
  },
  headerTitle: {
    fontFamily: fonts.label,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: colors.ink
  },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingVertical: 24 },
  section: { marginBottom: 32 },
  sectionTitle: { 
    fontFamily: fonts.label, 
    fontSize: 10, 
    textTransform: 'uppercase', 
    letterSpacing: 1.2, 
    color: colors.inkWhisper,
    paddingHorizontal: 24,
    marginBottom: 12
  },
  sectionContent: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.hairlineSoft,
    backgroundColor: colors.khadiLight
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft
  },
  rowLabel: { flex: 1, fontFamily: fonts.serif, fontSize: 16, color: colors.ink },
  rowValue: { fontFamily: fonts.body, fontSize: 14, color: colors.inkWhisper, marginRight: 8 }
});
