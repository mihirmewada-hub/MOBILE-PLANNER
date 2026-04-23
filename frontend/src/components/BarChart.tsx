import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import {
  Canvas,
  RoundedRect,
  LinearGradient as SkiaLG,
  vec,
  Group,
  BlurMask,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
  useDerivedValue,
} from 'react-native-reanimated';
import { colors, spring } from '../theme/tokens';
import { haptic } from '../hooks/useHaptics';
import { isSkiaSupported } from '../utils/skiaSupport';

export interface Bar {
  key: string;
  label: string;
  value: number; // hours
  color: string;
}

interface Props {
  width?: number;
  height?: number;
  bars: Bar[];
}

export function BarChart({ width = 320, height = 180, bars }: Props) {
  if (!isSkiaSupported) return <BarFallback width={width} height={height} bars={bars} />;
  const padding = { top: 26, bottom: 26, left: 10, right: 10 };
  const plotH = height - padding.top - padding.bottom;
  const plotW = width - padding.left - padding.right;
  const gap = 14;
  const barW = (plotW - gap * (bars.length - 1)) / bars.length;

  const maxVal = Math.max(...bars.map((b) => b.value), 0.0001);

  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <View style={{ width, height }}>
      <Canvas style={{ width, height }}>
        <Group>
          <BlurMask blur={6} style="solid" respectCTM={false} />
          {bars.map((b, i) => (
            <AnimatedBar
              key={b.key + 'blur'}
              x={padding.left + i * (barW + gap)}
              y={padding.top}
              width={barW}
              height={(b.value / maxVal) * plotH}
              plotH={plotH}
              color={b.color}
              index={i}
              dimmed={selected !== null && selected !== b.key}
              blurPass
            />
          ))}
        </Group>
        {bars.map((b, i) => (
          <AnimatedBar
            key={b.key}
            x={padding.left + i * (barW + gap)}
            y={padding.top}
            width={barW}
            height={(b.value / maxVal) * plotH}
            plotH={plotH}
            color={b.color}
            index={i}
            dimmed={selected !== null && selected !== b.key}
          />
        ))}
      </Canvas>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {bars.map((b, i) => {
          const bx = padding.left + i * (barW + gap);
          return (
            <React.Fragment key={b.key + 'fx'}>
              <Pressable
                onPress={() => {
                  haptic.light();
                  setSelected((s) => (s === b.key ? null : b.key));
                }}
                style={[
                  styles.hit,
                  {
                    left: bx,
                    top: padding.top,
                    width: barW,
                    height: plotH,
                  },
                ]}
                testID={`bar-${b.key}`}
              />
              <Text
                style={[
                  styles.valueLabel,
                  {
                    left: bx,
                    width: barW,
                    top: padding.top + plotH - (b.value / maxVal) * plotH - 20,
                    color: selected === b.key ? colors.crimsonGlow : '#fff',
                  },
                ]}
              >
                {b.value.toFixed(1)}h
              </Text>
              <Text
                style={[
                  styles.catLabel,
                  {
                    left: bx,
                    width: barW,
                    top: padding.top + plotH + 6,
                  },
                ]}
              >
                {b.label}
              </Text>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

function AnimatedBar({
  x,
  y,
  width,
  height,
  plotH,
  color,
  index,
  dimmed,
  blurPass,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  plotH: number;
  color: string;
  index: number;
  dimmed: boolean;
  blurPass?: boolean;
}) {
  const prog = useSharedValue(0);

  useEffect(() => {
    prog.value = 0;
    prog.value = withDelay(index * 100, withSpring(1, spring.bouncy));
  }, [height, index, prog]);

  const h = useDerivedValue(() => height * prog.value);
  const yv = useDerivedValue(() => y + (plotH - height * prog.value));
  const op = useDerivedValue(() => (dimmed ? 0.25 : 1));

  return (
    <RoundedRect
      x={x}
      y={yv}
      width={blurPass ? width + 2 : width}
      height={h}
      r={6}
      opacity={op}
    >
      <SkiaLG
        start={vec(x, y)}
        end={vec(x, y + plotH)}
        colors={[color, color + '55', 'transparent']}
      />
    </RoundedRect>
  );
}

const styles = StyleSheet.create({
  hit: {
    position: 'absolute',
  },
  valueLabel: {
    position: 'absolute',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  catLabel: {
    position: 'absolute',
    textAlign: 'center',
    fontSize: 11,
    color: colors.textDim,
  },
});

function BarFallback({ width, height, bars }: Props) {
  const max = Math.max(...bars.map((b) => b.value), 0.0001);
  const padding = { top: 26, bottom: 26 };
  const plotH = height - padding.top - padding.bottom;
  return (
    <View style={{ width, height, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: 26, paddingTop: 26 }}>
      {bars.map((b) => (
        <View key={b.key} style={{ alignItems: 'center', width: width / bars.length - 10 }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{b.value.toFixed(1)}h</Text>
          <View
            style={{
              width: '70%',
              height: (b.value / max) * plotH,
              borderRadius: 6,
              backgroundColor: b.color,
              opacity: 0.85,
              marginTop: 4,
            }}
          />
          <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 4 }}>{b.label}</Text>
        </View>
      ))}
    </View>
  );
}
