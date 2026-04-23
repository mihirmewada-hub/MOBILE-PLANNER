import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  Group,
  BlurMask,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useDerivedValue,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '../theme/tokens';
import { haptic } from '../hooks/useHaptics';
import { isSkiaSupported } from '../utils/skiaSupport';

export interface DonutSegment {
  key: string;
  label: string;
  value: number; // hours
  color: string;
}

interface Props {
  size?: number;
  stroke?: number;
  segments: DonutSegment[];
}

export function DonutChart({ size = 240, stroke = 26, segments }: Props) {
  if (!isSkiaSupported) return <DonutFallback size={size} segments={segments} />;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const total = segments.reduce((s, x) => s + x.value, 0) || 1;

  // Shared draw progress (0..1) — segments fill clockwise over total
  const drawProg = useSharedValue(0);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    drawProg.value = 0;
    drawProg.value = withDelay(
      100,
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) })
    );
  }, [segments, drawProg]);

  // Build fractions and cumulative ranges
  const fractions = segments.map((s) => s.value / total);
  const cumulative = fractions.reduce<number[]>((acc, v, i) => {
    acc.push((acc[i - 1] ?? 0) + v);
    return acc;
  }, []);

  const onSelect = (key: string) => {
    haptic.light();
    setSelected((s) => (s === key ? null : key));
  };

  const displaySeg = selected
    ? segments.find((x) => x.key === selected)
    : null;

  return (
    <View style={{ width: size, height: size }}>
      <Canvas style={{ width: size, height: size }}>
        <Group>
          <BlurMask blur={10} style="solid" respectCTM={false} />
          {segments.map((seg, i) => (
            <Seg
              key={seg.key}
              cx={cx}
              cy={cy}
              r={r}
              stroke={stroke}
              start={cumulative[i - 1] ?? 0}
              end={cumulative[i]}
              color={seg.color}
              progress={drawProg}
              dimmed={selected !== null && selected !== seg.key}
              blurPass
            />
          ))}
        </Group>
        {segments.map((seg, i) => (
          <Seg
            key={seg.key + 'line'}
            cx={cx}
            cy={cy}
            r={r}
            stroke={stroke}
            start={cumulative[i - 1] ?? 0}
            end={cumulative[i]}
            color={seg.color}
            progress={drawProg}
            dimmed={selected !== null && selected !== seg.key}
          />
        ))}
      </Canvas>

      <View style={[StyleSheet.absoluteFillObject, styles.center]} pointerEvents="box-none">
        <Text style={styles.totalValue}>
          {displaySeg ? `${displaySeg.value.toFixed(1)}h` : `${total.toFixed(1)}h`}
        </Text>
        <Text style={styles.totalLabel}>
          {displaySeg ? displaySeg.label : 'Total today'}
        </Text>
      </View>

      {/* Tap layer with wedge pressables (invisible, overlay) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {segments.map((seg, i) => {
          const midAngle =
            ((cumulative[i - 1] ?? 0) + cumulative[i]) / 2 * Math.PI * 2 - Math.PI / 2;
          const px = cx + Math.cos(midAngle) * (r + 4);
          const py = cy + Math.sin(midAngle) * (r + 4);
          return (
            <Pressable
              key={seg.key + 'hit'}
              onPress={() => onSelect(seg.key)}
              style={[
                styles.hit,
                {
                  left: px - 20,
                  top: py - 20,
                  backgroundColor: selected === seg.key ? seg.color + '30' : 'transparent',
                  borderColor: selected === seg.key ? seg.color : 'transparent',
                },
              ]}
              testID={`donut-segment-${seg.key}`}
            />
          );
        })}
      </View>
    </View>
  );
}

function Seg({
  cx,
  cy,
  r,
  stroke,
  start,
  end,
  color,
  progress,
  dimmed,
  blurPass,
}: {
  cx: number;
  cy: number;
  r: number;
  stroke: number;
  start: number;
  end: number;
  color: string;
  progress: Animated.SharedValue<number>;
  dimmed: boolean;
  blurPass?: boolean;
}) {
  const path = React.useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(cx, cy, r);
    return p;
  }, [cx, cy, r]);

  const startV = useDerivedValue(() => {
    // segment visible if progress reached start
    const p = progress.value;
    return Math.min(Math.max(p, start), end);
  });
  const endV = useDerivedValue(() => {
    const p = progress.value;
    return Math.min(Math.max(p, start), end);
  });

  // animated start is fixed start; animated end grows from start to end as progress moves across range
  const animStart = useDerivedValue(() => start);
  const animEnd = useDerivedValue(() => {
    const p = progress.value;
    if (p <= start) return start + 0.0001;
    if (p >= end) return end;
    return p;
  });

  const opacity = useDerivedValue(() => (dimmed ? 0.2 : 1));

  return (
    <Path
      path={path}
      color={color}
      style="stroke"
      strokeWidth={blurPass ? stroke + 2 : stroke}
      strokeCap="butt"
      start={animStart}
      end={animEnd}
      opacity={opacity}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  totalLabel: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  hit: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  fbWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fbRing: {
    borderRadius: 999,
  },
});

// Simple SVG fallback for web preview
import Svg, { Circle as SvgCircle } from 'react-native-svg';
function DonutFallback({ size, segments }: { size: number; segments: DonutSegment[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - 26) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <View style={[{ width: size, height: size }, styles.fbWrap]}>
      <Svg width={size} height={size}>
        {segments.map((s, i) => {
          const frac = s.value / total;
          const dash = c * frac;
          const el = (
            <SvgCircle
              key={s.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={s.color}
              strokeWidth={26}
              fill="none"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += dash;
          return el;
        })}
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, styles.center]} pointerEvents="none">
        <Text style={styles.totalValue}>{total.toFixed(1)}h</Text>
        <Text style={styles.totalLabel}>Total today</Text>
      </View>
    </View>
  );
}
