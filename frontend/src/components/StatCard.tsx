import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { colors, radius } from '../theme/tokens';

interface Props {
  label: string;
  value: number;
  unit?: string;
  accent?: string;
  testID?: string;
}

export function StatCard({ label, value, unit, accent = colors.crimson, testID }: Props) {
  const anim = useSharedValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    anim.value = 0;
    anim.value = withTiming(value, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [value, anim]);

  useDerivedValue(() => {
    runOnJS(setDisplay)(Math.round(anim.value));
  });

  const accentStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + anim.value / (value || 1) * 0.5,
  }));

  return (
    <View style={styles.card} testID={testID}>
      <Animated.View style={[styles.accent, { backgroundColor: accent }, accentStyle]} />
      <View style={styles.row}>
        <Text style={styles.value}>{display}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  unit: {
    color: colors.textDim,
    fontSize: 12,
    marginLeft: 4,
  },
  label: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
