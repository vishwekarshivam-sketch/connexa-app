import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { colors, fonts } from '@/tokens';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmWord: string;
  confirmLabel: string;
  isDestructive?: boolean;
}

export function TypedConfirmModal({
  isVisible,
  onClose,
  onConfirm,
  title,
  description,
  confirmWord,
  confirmLabel,
  isDestructive = false,
}: Props) {
  const [value, setValue] = useState('');
  const isMatch = value.trim().toUpperCase() === confirmWord.toUpperCase();

  const handleConfirm = () => {
    if (isMatch) {
      onConfirm();
      setValue('');
      onClose();
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, isDestructive && styles.destructiveBorder]}>
          <View style={styles.header}>
            <Text style={[styles.title, isDestructive && styles.destructiveText]}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Text style={styles.closeBtn}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={styles.description}>{description}</Text>
            
            <View style={styles.inputWrap}>
              <Text style={[styles.label, isDestructive && styles.destructiveText]}>
                Type {confirmWord} to confirm
              </Text>
              <TextInput
                style={[styles.input, isDestructive && styles.destructiveInput]}
                value={value}
                onChangeText={setValue}
                placeholder={confirmWord}
                placeholderTextColor={isDestructive ? 'rgba(168, 66, 31, 0.4)' : colors.inkWhisper}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <Text style={styles.hint}>This action cannot be undone.</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.btnGhost} onPress={onClose}>
              <Text style={styles.btnGhostText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.btnConfirm, 
                isDestructive ? styles.btnDestructive : styles.btnPrimary,
                !isMatch && styles.btnDisabled
              ]} 
              onPress={handleConfirm}
              disabled={!isMatch}
            >
              <Text style={styles.btnConfirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(21, 22, 28, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.khadiLight,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  destructiveBorder: {
    borderWidth: 2,
    borderColor: colors.ember,
  },
  header: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 18,
    fontWeight: '500',
    color: colors.ink,
  },
  destructiveText: {
    color: colors.ember,
  },
  closeBtn: {
    fontSize: 24,
    color: colors.inkMute,
    lineHeight: 24,
  },
  body: {
    padding: 20,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 22,
    marginBottom: 20,
  },
  inputWrap: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.label,
    fontSize: 9.5,
    fontWeight: '500',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.inkMute,
  },
  input: {
    width: '100%',
    backgroundColor: colors.khadi,
    borderWidth: 1,
    borderColor: colors.hairlineSoft,
    padding: 12,
    fontFamily: fonts.label,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.ink,
  },
  destructiveInput: {
    borderColor: colors.ember,
    color: colors.ember,
    borderWidth: 2,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    
    color: colors.inkMute,
  },
  footer: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  btnGhost: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  btnGhostText: {
    fontFamily: fonts.label,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.inkMute,
  },
  btnConfirm: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  btnPrimary: {
    backgroundColor: colors.ink,
  },
  btnDestructive: {
    backgroundColor: colors.ember,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnConfirmText: {
    fontFamily: fonts.label,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.khadi,
  },
});
