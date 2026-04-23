import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { GradientBackground } from '../../src/components/GradientBackground';
import { AmbientParticles } from '../../src/components/AmbientParticles';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { StatCard } from '../../src/components/StatCard';
import { DonutChart } from '../../src/components/DonutChart';
import { BarChart } from '../../src/components/BarChart';
import { LineChart } from '../../src/components/LineChart';
import { ProgressRing } from '../../src/components/ProgressRing';
import { useStore } from '../../src/store/useStore';
import { weeklyProductivity } from '../../src/store/demoData';
import { colors, radius, categoryColors } from '../../src/theme/tokens';

type Range = 'week' | 'month' | 'year';

export default function Analytics() {
  const [range, setRange] = useState<Range>('week');
  const { tasks } = useStore();
  const { width } = useWindowDimensions();
  const chartW = width - 40;

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.completed).length;
    const focusMin = tasks
      .filter((t) => t.completed)
      .reduce((acc, t) => {
        return (
          acc +
          Math.max(
            0,
            (new Date(t.endTime).getTime() - new Date(t.startTime).getTime()) / 60000
          )
        );
      }, 0);
    const focusH = Math.round(focusMin / 60 * 10) / 10;
    return { completed, focusH, streak: 12 };
  }, [tasks]);

  const donutSegments = [
    { key: 'work', label: 'Work', value: 2.5, color: categoryColors.work },
    { key: 'health', label: 'Health', value: 1.0, color: categoryColors.health },
    { key: 'study', label: 'Study', value: 0.75, color: categoryColors.study },
    { key: 'social', label: 'Social', value: 0.5, color: categoryColors.social },
    { key: 'creative', label: 'Creative', value: 1.5, color: categoryColors.creative },
    { key: 'free', label: 'Free', value: 9.75, color: 'rgba(255,255,255,0.12)' },
    { key: 'sleep', label: 'Sleep', value: 8, color: 'rgba(100,100,255,0.3)' },
  ];

  const bars = [
    { key: 'work', label: 'Work', value: 2.5, color: categoryColors.work },
    { key: 'health', label: 'Health', value: 1.0, color: categoryColors.health },
    { key: 'study', label: 'Study', value: 0.75, color: categoryColors.study },
    { key: 'social', label: 'Social', value: 0.5, color: categoryColors.social },
    { key: 'creative', label: 'Creative', value: 1.5, color: categoryColors.creative },
  ];

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const productivityScore = Math.round(
    weeklyProductivity.reduce((a, b) => a + b, 0) / weeklyProductivity.length
  );

  return (
    <GradientBackground>
      <AmbientParticles count={6} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Animated.Text entering={FadeIn.duration(500)} style={styles.title}>
            Analytics
          </Animated.Text>

          <SegmentedControl<Range>
            options={[
              { key: 'week', label: 'Week' },
              { key: 'month', label: 'Month' },
              { key: 'year', label: 'Year' },
            ]}
            value={range}
            onChange={setRange}
            testID="range-toggle"
          />

          {/* Stats Grid */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(500)}
            style={styles.statsRow}
          >
            <StatCard label="Completed" value={stats.completed} testID="stat-completed" />
            <StatCard
              label="Focus"
              value={stats.focusH}
              unit="h"
              accent={colors.crimsonGlow}
              testID="stat-focus"
            />
            <StatCard
              label="Streak"
              value={stats.streak}
              unit="d"
              accent={colors.roseGold}
              testID="stat-streak"
            />
          </Animated.View>

          {/* Donut Chart */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Day breakdown</Text>
            <Text style={styles.cardSub}>Tap a segment for details</Text>
            <View style={styles.donutCenter}>
              <DonutChart size={Math.min(280, chartW - 20)} stroke={28} segments={donutSegments} />
            </View>
            <View style={styles.legend}>
              {donutSegments.map((s) => (
                <View key={s.key} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                  <Text style={styles.legendText}>
                    {s.label} · {s.value}h
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Bar Chart */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(500)}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Time per category</Text>
            <Text style={styles.cardSub}>Today</Text>
            <View style={{ alignItems: 'center', marginTop: 14 }}>
              <BarChart width={chartW - 28} height={200} bars={bars} />
            </View>
          </Animated.View>

          {/* Line Chart */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(500)}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Weekly productivity</Text>
            <Text style={styles.cardSub}>7-day trend</Text>
            <View style={{ alignItems: 'center', marginTop: 14 }}>
              <LineChart width={chartW - 28} height={180} data={weeklyProductivity} labels={labels} />
            </View>
          </Animated.View>

          {/* Productivity Score */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(500)}
            style={[styles.card, styles.scoreCard]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Productivity score</Text>
              <Text style={styles.cardSub}>This week</Text>
              <Text style={styles.scoreBig}>{productivityScore}%</Text>
              <Text style={styles.scoreCap}>
                {productivityScore >= 80
                  ? 'Outstanding ⚡'
                  : productivityScore >= 50
                  ? 'Keep it up 🔥'
                  : 'Room to grow'}
              </Text>
            </View>
            <View style={styles.scoreRing}>
              <ProgressRing progress={productivityScore / 100} size={130} stroke={10} />
            </View>
          </Animated.View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 18,
    textShadowColor: 'rgba(229,57,53,0.4)',
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  card: {
    backgroundColor: colors.glass,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 16,
    marginTop: 16,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  cardSub: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  donutCenter: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    color: '#fff',
    fontSize: 11.5,
    fontWeight: '600',
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBig: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginTop: 8,
    textShadowColor: 'rgba(229,57,53,0.5)',
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 0 },
  },
  scoreCap: {
    color: colors.crimsonGlow,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  scoreRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
