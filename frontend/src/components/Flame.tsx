import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient as SvgLG, Stop } from 'react-native-svg';
import { colors } from '../theme/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
  size?: number;
}

export function Flame({ size = 28 }: Props) {
  const flicker = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    flicker.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 180, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.96, { duration: 220, easing: Easing.inOut(Easing.quad) }),
        withTiming(1.04, { duration: 150, easing: Easing.inOut(Easing.quad) }),
        withTiming(1.0, { duration: 200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 200 }),
        withTiming(1, { duration: 240 })
      ),
      -1,
      true
    );
  }, [flicker, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: flicker.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <SvgLG id="flameGrad" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor={colors.crimson} />
            <Stop offset="0.7" stopColor={colors.crimsonGlow} />
            <Stop offset="1" stopColor={colors.roseGold} />
          </SvgLG>
        </Defs>
        <AnimatedPath
          d="M12 2 C12 6 8 7 8 12 C8 16 10 18 12 22 C14 18 16 16 16 12 C16 9 14 8 12 5 Z"
          fill="url(#flameGrad)"
        />
      </Svg>
      <View style={styles.glow} pointerEvents="none" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    left: -6,
    top: -6,
    right: -6,
    bottom: -6,
    borderRadius: 20,
    backgroundColor: 'transparent',
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
});
