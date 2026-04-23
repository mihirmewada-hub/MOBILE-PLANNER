import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ScrollView,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '../theme/tokens';
import { haptic } from '../hooks/useHaptics';

const EMOJIS = [
  '🎯','💼','🏃','📚','🎨','☕','🧘','🍎','💪','🎵',
  '💡','🌱','✏️','🧠','📝','🛒','🎮','🎬','✈️','🏠',
  '💤','💰','🧹','🎉','❤️','⭐','🔥','🌙','☀️','⚡',
];

const COLORS = [
  '#E53935', '#FF8A80', '#FFB74D', '#FFD54F', '#4CAF50',
  '#64B5F6', '#7E57C2', '#BA68C8', '#F06292', '#4DD0E1',
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; emoji: string; color: string }) => void;
}

export function AddCategorySheet({ visible, onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [color, setColor] = useState(COLORS[0]);

  React.useEffect(() => {
    if (visible) {
      setName('');
      setEmoji('🎯');
      setColor(COLORS[0]);
    }
  }, [visible]);

  const canSubmit = name.trim().length > 0;

  const handleCreate = () => {
    if (!canSubmit) {
      haptic.warning();
      return;
    }
    haptic.success();
    onCreate({ name: name.trim(), emoji, color });
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <Animated.View entering={FadeIn.duration(180)} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} testID="addcat-backdrop" />
      </Animated.View>

      <Animated.View
        entering={SlideInDown.springify().damping(20).mass(0.9)}
        exiting={SlideOutDown.duration(200)}
        style={styles.sheet}
      >
        <LinearGradient
          colors={[colors.bgTop, colors.bgMid, colors.bgBottom]}
          style={StyleSheet.absoluteFill}
        />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>New category</Text>
            <Text style={styles.subtitle}>Pick an emoji, name, and colour</Text>

            {/* Preview */}
            <View style={styles.previewWrap}>
              <LinearGradient
                colors={[color, colors.crimson]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.previewPill}
              >
                <Text style={styles.previewEmoji}>{emoji}</Text>
                <Text style={styles.previewLabel}>{name.trim() || 'Category'}</Text>
              </LinearGradient>
            </View>

            {/* Name input */}
            <Text style={styles.sectionLabel}>Name</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Workout"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={name}
                onChangeText={setName}
                maxLength={20}
                autoFocus
                testID="addcat-name"
              />
            </View>

            {/* Emoji grid */}
            <Text style={styles.sectionLabel}>Emoji</Text>
            <View style={styles.emojiGrid}>
              {EMOJIS.map((e) => {
                const active = e === emoji;
                return (
                  <Pressable
                    key={e}
                    onPress={() => {
                      haptic.selection();
                      setEmoji(e);
                    }}
                    style={[styles.emojiCell, active && styles.emojiCellActive]}
                    testID={`addcat-emoji-${e}`}
                  >
                    <Text style={styles.emojiChar}>{e}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Color row */}
            <Text style={styles.sectionLabel}>Colour</Text>
            <View style={styles.colorRow}>
              {COLORS.map((c) => {
                const active = c === color;
                return (
                  <Pressable
                    key={c}
                    onPress={() => {
                      haptic.selection();
                      setColor(c);
                    }}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: c },
                      active && styles.colorSwatchActive,
                    ]}
                    testID={`addcat-color-${c}`}
                  />
                );
              })}
            </View>

            <View style={{ height: 18 }} />

            {/* Create button */}
            <Pressable
              style={[styles.submit, !canSubmit && styles.submitDisabled]}
              onPress={handleCreate}
              testID="addcat-submit"
            >
              <LinearGradient
                colors={
                  canSubmit
                    ? [colors.crimsonGlow, colors.crimson]
                    : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.05)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.submitText}>Create category</Text>
            </Pressable>
            <View style={{ height: 24 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '82%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(229,57,53,0.25)',
    overflow: 'hidden',
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 4,
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: 2,
  },
  previewWrap: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 6,
  },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    gap: 10,
    shadowColor: colors.crimson,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  previewEmoji: {
    fontSize: 22,
  },
  previewLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  sectionLabel: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
  },
  inputRow: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 52,
    justifyContent: 'center',
  },
  input: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emojiCell: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiCellActive: {
    borderColor: colors.crimson,
    backgroundColor: 'rgba(229,57,53,0.18)',
    shadowColor: colors.crimson,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  emojiChar: {
    fontSize: 22,
    lineHeight: 26,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorSwatch: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  colorSwatchActive: {
    borderColor: '#fff',
    transform: [{ scale: 1.1 }],
    shadowColor: '#fff',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  submit: {
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: colors.crimson,
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  submitDisabled: {
    shadowOpacity: 0,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
