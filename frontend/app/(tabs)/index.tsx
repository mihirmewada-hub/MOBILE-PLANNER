import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Bell } from 'lucide-react-native';
import { GradientBackground } from '../../src/components/GradientBackground';
import { ProgressRing } from '../../src/components/ProgressRing';
import { CategoryPill } from '../../src/components/CategoryPill';
import { TaskCard } from '../../src/components/TaskCard';
import { Flame } from '../../src/components/Flame';
import { AmbientParticles } from '../../src/components/AmbientParticles';
import { AddCategorySheet } from '../../src/components/AddCategorySheet';
import { useStore } from '../../src/store/useStore';
import { colors, radius } from '../../src/theme/tokens';
import { useTheme } from '../../src/theme/useTheme';
import { CategoryKey } from '../../src/store/types';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const HEADER_MAX = 160;

export default function Dashboard() {
  const { tasks, categories, user } = useStore();
  const addCategory = useStore((s) => s.addCategory);
  const t = useTheme((s) => s.t);
  const { width } = useWindowDimensions();
  const [activeCat, setActiveCat] = useState<string>('all');
  const [showAddCat, setShowAddCat] = useState(false);
  const scrollY = useSharedValue(0);

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateNum = today.getDate();

  const visibleTasks = useMemo(
    () =>
      activeCat === 'all'
        ? tasks
        : tasks.filter((t) => t.category === activeCat),
    [tasks, activeCat]
  );

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length || 1;
  const progress = completedCount / totalCount;

  const greeting = (() => {
    const h = today.getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const headerParallax = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, HEADER_MAX],
          [0, -HEADER_MAX * 0.5],
          Extrapolation.CLAMP
        ),
      },
    ],
    opacity: interpolate(scrollY.value, [0, HEADER_MAX], [1, 0.5], Extrapolation.CLAMP),
  }));

  const dateParallax = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(scrollY.value, [0, HEADER_MAX], [0, -20], Extrapolation.CLAMP) },
    ],
  }));

  const toggleTask = useStore((s) => s.toggleTask);
  const deleteTask = useStore((s) => s.deleteTask);

  return (
    <GradientBackground>
      <AmbientParticles count={7} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <AnimatedScrollView
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <Animated.View style={[styles.headerWrap, headerParallax]}>
            <Animated.View
              entering={FadeIn.duration(500).delay(200)}
              style={styles.headerTopRow}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.greeting, { color: t.textDim }]}>{greeting},</Text>
                <Text style={[styles.userName, { color: t.text }]}>{user.name.split(' ')[0]}</Text>
              </View>
              <View style={styles.headerIcons}>
                <View style={styles.streak}>
                  <Flame size={22} />
                  <Text style={styles.streakNum}>{user.streak}</Text>
                </View>
                <View style={styles.bellWrap}>
                  <Bell size={20} color="#fff" strokeWidth={2} />
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>3</Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(600)} style={[styles.dateRow, dateParallax]}>
              <Text style={[styles.weekday, { color: t.textDim }]}>{dayName},</Text>
              <Text style={[styles.bigDate, { color: t.text }]}>{dateNum}</Text>
            </Animated.View>
          </Animated.View>

          {/* Progress Ring Card */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)} style={[styles.ringCard, { backgroundColor: t.glass, borderColor: t.glassBorder }]}>
            <View style={styles.ringLeft}>
              <ProgressRing progress={progress} size={160} stroke={12} label="Today" />
            </View>
            <View style={styles.ringRight}>
              <Text style={[styles.ringTitle, { color: t.text }]}>Daily goal</Text>
              <Text style={[styles.ringSubtitle, { color: t.textDim }]}>
                {completedCount} of {tasks.length} tasks
              </Text>
              <View style={styles.chipsRow}>
                <View style={[styles.miniChip, { backgroundColor: 'rgba(76,175,80,0.12)' }]}>
                  <Text style={[styles.miniChipText, { color: colors.success }]}>
                    {completedCount} done
                  </Text>
                </View>
                <View style={[styles.miniChip, { backgroundColor: 'rgba(229,57,53,0.12)' }]}>
                  <Text style={[styles.miniChipText, { color: colors.crimsonGlow }]}>
                    {tasks.length - completedCount} left
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Categories */}
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Categories</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catRow}
          >
            <View style={{ marginRight: 10 }}>
              <Pressable
                onPress={() => setActiveCat('all')}
                style={[styles.allPill, activeCat === 'all' && styles.allPillActive]}
                testID="category-all"
              >
                <Text
                  style={[
                    styles.allPillText,
                    activeCat === 'all' && styles.allPillTextActive,
                  ]}
                >
                  All
                </Text>
              </Pressable>
            </View>
            {categories.map((c) => (
              <CategoryPill
                key={c.id}
                keyId={c.key}
                label={c.name}
                color={c.color}
                emoji={c.emoji}
                active={activeCat === c.key}
                onPress={() => setActiveCat(c.key)}
                testID={`category-${c.key}`}
              />
            ))}
            <Pressable
              onPress={() => {
                setShowAddCat(true);
              }}
              style={styles.addPill}
              testID="category-add"
            >
              <Text style={styles.addPlus}>+</Text>
              <Text style={styles.addLabel}>New</Text>
            </Pressable>
          </ScrollView>

          {/* Tasks */}
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Today&apos;s tasks</Text>
            <Pressable>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          <View style={styles.taskList}>
            {visibleTasks.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No tasks here</Text>
                <Text style={styles.emptySub}>Tap + to create one</Text>
              </View>
            ) : (
              visibleTasks.map((t, i) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  index={i}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              ))
            )}
          </View>
          <View style={{ height: 120 }} />
        </AnimatedScrollView>
      </SafeAreaView>

      <AddCategorySheet
        visible={showAddCat}
        onClose={() => setShowAddCat(false)}
        onCreate={({ name, emoji, color }) => {
          addCategory({ name, emoji, color });
          setShowAddCat(false);
        }}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  headerWrap: {
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  greeting: {
    color: colors.textDim,
    fontSize: 13,
    letterSpacing: 0.6,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 2,
    textShadowColor: 'rgba(229,57,53,0.4)',
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229,57,53,0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.3)',
  },
  streakNum: {
    color: '#fff',
    fontWeight: '800',
    marginLeft: 6,
    fontSize: 14,
  },
  bellWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.crimson,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.bgBase,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 14,
  },
  weekday: {
    color: colors.textDim,
    fontSize: 16,
    marginRight: 10,
  },
  bigDate: {
    color: '#fff',
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 60,
  },

  ringCard: {
    backgroundColor: colors.glass,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    overflow: 'hidden',
  },
  ringLeft: {
    width: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringRight: {
    flex: 1,
    paddingLeft: 12,
  },
  ringTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  ringSubtitle: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  miniChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  miniChipText: {
    fontSize: 12,
    fontWeight: '700',
  },

  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  seeAll: {
    color: colors.crimsonGlow,
    fontSize: 13,
    fontWeight: '600',
  },
  catRow: {
    paddingVertical: 4,
    paddingRight: 12,
  },
  allPill: {
    height: 66,
    minWidth: 66,
    paddingHorizontal: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  allPillActive: {
    backgroundColor: 'rgba(229,57,53,0.25)',
    borderColor: 'rgba(229,57,53,0.6)',
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
  },
  allPillText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '700',
    fontSize: 14,
  },
  allPillTextActive: {
    color: '#fff',
  },
  addPill: {
    height: 66,
    width: 66,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(229,57,53,0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(229,57,53,0.4)',
    borderStyle: 'dashed',
    marginLeft: 4,
  },
  addPlus: {
    color: colors.crimsonGlow,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 26,
  },
  addLabel: {
    color: colors.crimsonGlow,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },

  taskList: {
    marginTop: 4,
  },
  empty: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    color: colors.textDim,
    marginTop: 6,
  },
});
