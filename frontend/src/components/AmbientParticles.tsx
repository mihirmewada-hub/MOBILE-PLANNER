import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  BlurMask,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  useDerivedValue,
} from 'react-native-reanimated';
import { colors } from '../theme/tokens';
import { isSkiaSupported } from '../utils/skiaSupport';

const { width: SCR_W, height: SCR_H } = Dimensions.get('window');

// Ambient drifting particles over the background
export function AmbientParticles({ count = 8 }: { count?: number }) {
  if (!isSkiaSupported) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFill}>
        <Group>
          <BlurMask blur={4} style="solid" />
          {Array.from({ length: count }, (_, i) => (
            <Drifter key={i} idx={i} />
          ))}
        </Group>
      </Canvas>
    </View>
  );
}

function Drifter({ idx }: { idx: number }) {
  const t = useSharedValue(0);
  const seedX = (idx * 73) % SCR_W;
  const seedY = (idx * 151) % SCR_H;
  const ampX = 30 + ((idx * 17) % 50);
  const ampY = 60 + ((idx * 23) % 120);
  const dur = 6000 + (idx * 1500) % 8000;

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: dur, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [t, dur]);

  const cx = useDerivedValue(() => seedX + Math.sin(t.value * Math.PI * 2) * ampX);
  const cy = useDerivedValue(() => seedY + Math.cos(t.value * Math.PI * 2) * ampY);
  const op = useDerivedValue(() => 0.15 + t.value * 0.25);
  const rr = useDerivedValue(() => 2 + t.value * 2);

  return <Circle cx={cx} cy={cy} r={rr} color={colors.crimsonGlow} opacity={op} />;
}
