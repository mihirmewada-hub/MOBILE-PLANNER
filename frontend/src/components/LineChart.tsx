import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  LinearGradient as SkiaLG,
  vec,
  Group,
  Circle,
  BlurMask,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useDerivedValue,
  withDelay,
} from 'react-native-reanimated';
import Svg, { Path as SvgPath, Circle as SvgCircle, Defs, LinearGradient as SvgLG, Stop } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { isSkiaSupported } from '../utils/skiaSupport';

interface Props {
  width?: number;
  height?: number;
  data: number[]; // 0..100 per day
  labels?: string[];
}

export function LineChart({ width = 320, height = 180, data, labels }: Props) {
  if (!isSkiaSupported) return <LineFallback width={width} height={height} data={data} labels={labels} />;
  const padding = { top: 20, bottom: 30, left: 16, right: 16 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const n = data.length;
  const stepX = plotW / (n - 1 || 1);

  const maxV = 100;

  const pts = data.map((v, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + plotH * (1 - v / maxV),
  }));

  const linePath = React.useMemo(() => {
    const p = Skia.Path.Make();
    if (pts.length === 0) return p;
    p.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const cur = pts[i];
      const cpx = (prev.x + cur.x) / 2;
      p.cubicTo(cpx, prev.y, cpx, cur.y, cur.x, cur.y);
    }
    return p;
  }, [pts]);

  const fillPath = React.useMemo(() => {
    const p = linePath.copy();
    if (pts.length > 0) {
      p.lineTo(pts[pts.length - 1].x, padding.top + plotH);
      p.lineTo(pts[0].x, padding.top + plotH);
      p.close();
    }
    return p;
  }, [linePath, pts, padding.top, plotH]);

  const drawProg = useSharedValue(0);
  const fillOp = useSharedValue(0);
  const dotProg = useSharedValue(0);

  useEffect(() => {
    drawProg.value = 0;
    fillOp.value = 0;
    dotProg.value = 0;
    drawProg.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) });
    fillOp.value = withDelay(800, withTiming(0.35, { duration: 700 }));
    dotProg.value = withDelay(500, withTiming(1, { duration: 1200 }));
  }, [data, drawProg, fillOp, dotProg]);

  const end = useDerivedValue(() => drawProg.value);
  const fillOpacity = useDerivedValue(() => fillOp.value);

  return (
    <View style={{ width, height }}>
      <Canvas style={{ width, height }}>
        {/* filled gradient */}
        <Path path={fillPath} opacity={fillOpacity}>
          <SkiaLG
            start={vec(0, padding.top)}
            end={vec(0, padding.top + plotH)}
            colors={[colors.crimson, 'transparent']}
          />
        </Path>
        <Group>
          <BlurMask blur={8} style="solid" />
          <Path
            path={linePath}
            style="stroke"
            strokeWidth={4}
            strokeCap="round"
            strokeJoin="round"
            start={0}
            end={end}
          >
            <SkiaLG
              start={vec(padding.left, 0)}
              end={vec(padding.left + plotW, 0)}
              colors={[colors.crimson, colors.crimsonGlow, colors.roseGold]}
            />
          </Path>
        </Group>
        <Path
          path={linePath}
          style="stroke"
          strokeWidth={3}
          strokeCap="round"
          strokeJoin="round"
          start={0}
          end={end}
        >
          <SkiaLG
            start={vec(padding.left, 0)}
            end={vec(padding.left + plotW, 0)}
            colors={[colors.crimson, colors.crimsonGlow, colors.roseGold]}
          />
        </Path>
        {pts.map((pt, i) => (
          <Dot key={i} x={pt.x} y={pt.y} progress={drawProg} threshold={i / (n - 1 || 1)} />
        ))}
      </Canvas>

      {labels && (
        <View style={[styles.labelRow, { paddingHorizontal: padding.left, top: padding.top + plotH + 4 }]}>
          {labels.map((l, i) => (
            <Text key={i} style={styles.label}>
              {l}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

function Dot({
  x,
  y,
  progress,
  threshold,
}: {
  x: number;
  y: number;
  progress: Animated.SharedValue<number>;
  threshold: number;
}) {
  const r = useDerivedValue(() => (progress.value >= threshold ? 5 : 0));
  const opacity = useDerivedValue(() => (progress.value >= threshold ? 1 : 0));
  return (
    <Group>
      <Circle cx={x} cy={y} r={r} color={colors.crimsonGlow} opacity={opacity} />
      <Circle cx={x} cy={y} r={useDerivedValue(() => r.value - 2)} color="#fff" opacity={opacity} />
    </Group>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '500',
  },
});

function LineFallback({ width, height, data, labels }: Props) {
  const padding = { top: 20, bottom: 30, left: 16, right: 16 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const n = data.length;
  const stepX = plotW / (n - 1 || 1);
  const pts = data.map((v, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + plotH * (1 - v / 100),
  }));
  const pathD = pts
    .map((p, i) => (i === 0 ? `M${p.x} ${p.y}` : `L${p.x} ${p.y}`))
    .join(' ');
  const fillD = `${pathD} L${pts[pts.length - 1].x} ${padding.top + plotH} L${pts[0].x} ${padding.top + plotH} Z`;
  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <SvgLG id="lf" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.crimson} stopOpacity="0.6" />
            <Stop offset="1" stopColor={colors.crimson} stopOpacity="0" />
          </SvgLG>
        </Defs>
        <SvgPath d={fillD} fill="url(#lf)" />
        <SvgPath d={pathD} stroke={colors.crimsonGlow} strokeWidth={3} fill="none" strokeLinecap="round" />
        {pts.map((p, i) => (
          <SvgCircle key={i} cx={p.x} cy={p.y} r={4} fill="#fff" stroke={colors.crimsonGlow} strokeWidth={2} />
        ))}
      </Svg>
      {labels && (
        <View style={[styles.labelRow, { paddingHorizontal: padding.left, top: padding.top + plotH + 4 }]}>
          {labels.map((l, i) => (
            <Text key={i} style={styles.label}>{l}</Text>
          ))}
        </View>
      )}
    </View>
  );
}
