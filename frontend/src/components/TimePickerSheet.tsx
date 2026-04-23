import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Modal } from 'react-native';
import Animated, {
  FadeIn,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '../theme/tokens';
import { WheelPicker } from './WheelPicker';
import { haptic } from '../hooks/useHaptics';

interface Props {
  visible: boolean;
  title: string;
  initial: string; // "HH:MM AM/PM" or "Midnight" etc. We'll parse best effort
  onClose: () => void;
  onConfirm: (value: string) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINS = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
const APS = ['AM', 'PM'];

function parseTime(input: string): { h: string; m: string; ap: string } {
  const match = input.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    return {
      h: match[1].padStart(2, '0'),
      m: match[2],
      ap: match[3].toUpperCase(),
    };
  }
  if (input.toLowerCase() === 'midnight') return { h: '12', m: '00', ap: 'AM' };
  if (input.toLowerCase() === 'noon') return { h: '12', m: '00', ap: 'PM' };
  return { h: '09', m: '00', ap: 'AM' };
}

export function TimePickerSheet({ visible, title, initial, onClose, onConfirm }: Props) {
  const parsed = parseTime(initial);
  const [h, setH] = useState(parsed.h);
  const [m, setM] = useState(parsed.m);
  const [ap, setAp] = useState(parsed.ap);

  // Re-sync when opened
  React.useEffect(() => {
    if (visible) {
      const p = parseTime(initial);
      setH(p.h);
      setM(p.m);
      setAp(p.ap);
    }
  }, [visible, initial]);

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <Animated.View
        entering={FadeIn.duration(180)}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} testID="time-picker-backdrop" />
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
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.wheelRow}>
          <WheelPicker items={HOURS} value={h} onChange={(v) => setH(String(v))} />
          <Text style={styles.colon}>:</Text>
          <WheelPicker items={MINS} value={m} onChange={(v) => setM(String(v))} />
          <WheelPicker items={APS} value={ap} onChange={(v) => setAp(String(v))} width={72} />
        </View>

        <Pressable
          style={styles.done}
          onPress={() => {
            haptic.medium();
            onConfirm(`${h}:${m} ${ap}`);
          }}
          testID="time-picker-done"
        >
          <LinearGradient
            colors={[colors.crimsonGlow, colors.crimson]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
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
    height: 480,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(229,57,53,0.25)',
    overflow: 'hidden',
    paddingBottom: 24,
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  wheelRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 20,
  },
  colon: {
    color: colors.crimsonGlow,
    fontSize: 26,
    fontWeight: '900',
    marginHorizontal: 4,
    textShadowColor: 'rgba(229,57,53,0.5)',
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 0 },
  },
  done: {
    marginHorizontal: 24,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: colors.crimson,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  doneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
