import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgLG, Stop } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { isSkiaSupported } from '../utils/skiaSupport';

interface Props {
  size?: number;
  stroke?: number;
  progress: number; // 0..1
  label?: string;
}

// Native: uses Skia for GPU path drawing. Web: falls back to SVG for compatibility.
export function ProgressRing({ size = 180, stroke = 10, progress, label }: Props) {
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  const animated = useSharedValue(0);
  const pulse = useSharedValue(1);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    animated.value = 0;
    animated.value = withTiming(progress, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
    pulse.value = withRepeat(
      withTiming(1.04, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [progress, animated, pulse]);

  useDerivedValue(() => {
    const v = Math.round(animated.value * 100);
    runOnJS(setDisplayValue)(v);
  });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (isSkiaSupported) {
    return <SkiaRing size={size} stroke={stroke} r={r} cx={cx} cy={cy} animated={animated} displayValue={displayValue} label={label} animStyle={animStyle} />;
  }

  // SVG fallback (web)
  return (
    <Animated.View style={[{ width: size, height: size }, animStyle]}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgLG id="pr" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.crimson} />
            <Stop offset="0.5" stopColor={colors.crimsonGlow} />
            <Stop offset="1" stopColor={colors.roseGold} />
          </SvgLG>
        </Defs>
        <Circle cx={cx} cy={cy} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke="url(#pr)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference * progress} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, styles.centerLabel]} pointerEvents="none">
        <Text style={styles.percent}>{displayValue}%</Text>
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </View>
    </Animated.View>
  );
}

// --- Native Skia version (only imported/run when Skia is supported) ---
function SkiaRing({
  size,
  stroke,
  r,
  cx,
  cy,
  animated,
  displayValue,
  label,
  animStyle,
}: any) {
  // Lazy require to avoid evaluating Skia on web
  const { Canvas, Path, Skia, SweepGradient, vec, Group, BlurMask } = require('@shopify/react-native-skia');

  const circlePath = React.useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(cx, cy, r);
    return p;
  }, [cx, cy, r, Skia]);

  const end = useDerivedValue(() => animated.value);

  return (
    <Animated.View style={[{ width: size, height: size }, animStyle]}>
      <Canvas style={{ width: size, height: size }}>
        <Group>
          <Path
            path={circlePath}
            color={'rgba(255,255,255,0.06)'}
            style="stroke"
            strokeWidth={stroke}
            strokeCap="round"
          />
          <Group>
            <BlurMask blur={8} style="solid" />
            <Path
              path={circlePath}
              style="stroke"
              strokeWidth={stroke}
              strokeCap="round"
              start={0}
              end={end}
            >
              <SweepGradient
                c={vec(cx, cy)}
                colors={[colors.crimson, colors.crimsonGlow, colors.roseGold, colors.crimson]}
              />
            </Path>
          </Group>
          <Path
            path={circlePath}
            style="stroke"
            strokeWidth={stroke}
            strokeCap="round"
            start={0}
            end={end}
          >
            <SweepGradient
              c={vec(cx, cy)}
              colors={[colors.crimson, colors.crimsonGlow, colors.roseGold, colors.crimson]}
            />
          </Path>
        </Group>
      </Canvas>
      <View style={[StyleSheet.absoluteFillObject, styles.centerLabel]} pointerEvents="none">
        <Text style={styles.percent}>{displayValue}%</Text>
        {label ? <Text style={styles.label}>{label}</Text> : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
    textShadowColor: 'rgba(229,57,53,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  label: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
