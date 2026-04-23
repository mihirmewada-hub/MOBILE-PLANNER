import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spring, radius } from '../theme/tokens';
import { haptic } from '../hooks/useHaptics';

interface Props<T extends string> {
  options: { key: T; label: string; color?: string }[];
  value: T;
  onChange: (v: T) => void;
  testID?: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, testID }: Props<T>) {
  const [width, setWidth] = React.useState(0);
  const count = options.length;
  const segW = width / count;
  const translateX = useSharedValue(0);

  const activeIndex = Math.max(0, options.findIndex((o) => o.key === value));

  useEffect(() => {
    translateX.value = withSpring(activeIndex * segW, spring.snappy);
  }, [activeIndex, segW, translateX]);

  const activeColor = options[activeIndex]?.color ?? colors.crimson;

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: segW,
  }));

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.track} onLayout={onLayout} testID={testID}>
      {width > 0 && (
        <Animated.View style={[styles.pill, pillStyle]} pointerEvents="none">
          <LinearGradient
            colors={[activeColor, colors.crimson]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            style={styles.seg}
            onPress={() => {
              haptic.selection();
              onChange(opt.key);
            }}
            testID={`${testID}-${opt.key}`}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.pill,
    height: 44,
    padding: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  pill: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    borderRadius: radius.pill,
    overflow: 'hidden',
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
  },
  seg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  label: {
    color: colors.textDim,
    fontSize: 14,
    fontWeight: '600',
  },
  labelActive: {
    color: '#fff',
    fontWeight: '700',
  },
});
