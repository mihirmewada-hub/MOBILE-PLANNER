import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  FadeIn,
  SlideInDown,
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Briefcase,
  Heart,
  BookOpen,
  Users,
  Palette,
  Sparkles,
  Clock,
  LucideIcon,
  Check,
} from 'lucide-react-native';
import { colors, radius, spring, categoryColors } from '../src/theme/tokens';
import { CategoryKey, Priority, Repeat } from '../src/store/types';
import { useStore } from '../src/store/useStore';
import { SegmentedControl } from '../src/components/SegmentedControl';
import { WheelPicker } from '../src/components/WheelPicker';
import { haptic } from '../src/hooks/useHaptics';

const CATS: { key: CategoryKey; label: string; icon: LucideIcon; color: string }[] = [
  { key: 'work', label: 'Work', icon: Briefcase, color: categoryColors.work },
  { key: 'health', label: 'Health', icon: Heart, color: categoryColors.health },
  { key: 'study', label: 'Study', icon: BookOpen, color: categoryColors.study },
  { key: 'social', label: 'Social', icon: Users, color: categoryColors.social },
  { key: 'creative', label: 'Creative', icon: Palette, color: categoryColors.creative },
];

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const APS = ['AM', 'PM'];

export default function CreateTask() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: CategoryKey }>();
  const addTask = useStore((s) => s.addTask);

  const [title, setTitle] = useState('');
  const [cat, setCat] = useState<CategoryKey>((params.category as CategoryKey) || 'work');
  const [priority, setPriority] = useState<Priority>('medium');
  const [repeat, setRepeat] = useState<Repeat>('none');
  const [reminder, setReminder] = useState(15);

  const [showTimePicker, setShowTimePicker] = useState<'start' | 'end' | null>(null);
  const [startH, setStartH] = useState<string>('09');
  const [startM, setStartM] = useState<string>('00');
  const [startAp, setStartAp] = useState<string>('AM');
  const [endH, setEndH] = useState<string>('10');
  const [endM, setEndM] = useState<string>('00');
  const [endAp, setEndAp] = useState<string>('AM');

  // Sheet animation
  const translateY = useSharedValue(600);
  const backdropOp = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
    backdropOp.value = withTiming(1, { duration: 220 });
  }, [translateY, backdropOp]);

  const close = () => {
    backdropOp.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(700, { duration: 240 }, () => {
      runOnJS(router.back)();
    });
  };

  // Drag to dismiss
  const pan = Gesture.Pan()
    .onChange((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 800) {
        backdropOp.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(700, { duration: 240 }, () => {
          runOnJS(router.back)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOp.value * 0.6,
  }));

  // Submit animation
  const submitScale = useSharedValue(1);
  const submitBg = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 2500 }), -1, false);
  }, [shimmer]);

  const submitStyle = useAnimatedStyle(() => ({
    transform: [{ scale: submitScale.value }],
  }));
  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -100 + shimmer.value * 400 }],
  }));

  const to24h = (h: string, m: string, ap: string) => {
    let hr = parseInt(h, 10) % 12;
    if (ap === 'PM') hr += 12;
    return { hr, min: parseInt(m, 10) };
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      haptic.warning();
      submitScale.value = withSequence(
        withTiming(1.02, { duration: 60 }),
        withTiming(0.98, { duration: 60 }),
        withTiming(1, { duration: 60 })
      );
      return;
    }
    haptic.success();
    setSubmitting(true);
    submitScale.value = withSpring(0.97, { damping: 20, stiffness: 400 });

    const now = new Date();
    const { hr: sh, min: sm } = to24h(startH, startM, startAp);
    const { hr: eh, min: em } = to24h(endH, endM, endAp);
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), sh, sm);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), eh, em);
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;

    setTimeout(() => {
      addTask({
        title: title.trim(),
        category: cat,
        priority,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        date: dateStr,
        repeat,
        reminder,
      });
      close();
    }, 450);
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} testID="backdrop" />
      </Animated.View>

      <Animated.View style={[styles.sheet, sheetStyle]}>
        <LinearGradient
          colors={[colors.bgTop, colors.bgMid, colors.bgBottom]}
          style={StyleSheet.absoluteFill}
        />
        <GestureDetector gesture={pan}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>
        </GestureDetector>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={8}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.Text entering={FadeIn.duration(350)} style={styles.title}>
              New task
            </Animated.Text>
            <Text style={styles.subtitle}>Design something worth doing</Text>

            {/* Title input */}
            <View style={styles.inputRow}>
              <Sparkles size={18} color={colors.crimsonGlow} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="What needs to be done?"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={title}
                onChangeText={setTitle}
                autoFocus
                testID="task-title-input"
              />
            </View>

            {/* Category chips */}
            <Text style={styles.label}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 4 }}
            >
              {CATS.map((c) => {
                const active = c.key === cat;
                const Icon = c.icon;
                return (
                  <Pressable
                    key={c.key}
                    onPress={() => {
                      haptic.selection();
                      setCat(c.key);
                    }}
                    style={[
                      styles.catChip,
                      active && { borderColor: c.color + 'cc' },
                    ]}
                    testID={`cat-${c.key}`}
                  >
                    {active && (
                      <LinearGradient
                        colors={[c.color + 'aa', c.color + '55']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <Icon
                      size={22}
                      color={active ? '#fff' : c.color}
                      strokeWidth={2.2}
                    />
                    <Text style={[styles.catLabel, active && styles.catLabelActive]}>
                      {c.label}
                    </Text>
                    {active && (
                      <View style={styles.checkBadge}>
                        <Check size={10} color="#fff" strokeWidth={3} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Priority */}
            <Text style={styles.label}>Priority</Text>
            <SegmentedControl<Priority>
              options={[
                { key: 'high', label: 'High', color: colors.priorityHigh },
                { key: 'medium', label: 'Medium', color: colors.priorityMed },
                { key: 'low', label: 'Low', color: colors.priorityLow },
              ]}
              value={priority}
              onChange={setPriority}
              testID="priority"
            />

            {/* Time pickers */}
            <Text style={styles.label}>Time</Text>
            <View style={styles.timeRow}>
              <Pressable
                style={styles.timeBtn}
                onPress={() => {
                  Keyboard.dismiss();
                  haptic.light();
                  setShowTimePicker(showTimePicker === 'start' ? null : 'start');
                }}
                testID="time-start"
              >
                <Clock size={14} color={colors.textDim} />
                <Text style={styles.timeLabel}>Start</Text>
                <Text style={styles.timeValue}>
                  {startH}:{startM} {startAp}
                </Text>
              </Pressable>
              <View style={styles.timeLinkLine} />
              <Pressable
                style={styles.timeBtn}
                onPress={() => {
                  Keyboard.dismiss();
                  haptic.light();
                  setShowTimePicker(showTimePicker === 'end' ? null : 'end');
                }}
                testID="time-end"
              >
                <Clock size={14} color={colors.textDim} />
                <Text style={styles.timeLabel}>End</Text>
                <Text style={styles.timeValue}>
                  {endH}:{endM} {endAp}
                </Text>
              </Pressable>
            </View>

            {showTimePicker && (
              <Animated.View
                entering={FadeIn.duration(200)}
                style={styles.wheelPicker}
              >
                <Text style={styles.wheelTitle}>
                  {showTimePicker === 'start' ? 'Start time' : 'End time'}
                </Text>
                <View style={styles.wheelRow}>
                  <WheelPicker
                    items={HOURS}
                    value={showTimePicker === 'start' ? startH : endH}
                    onChange={(v) =>
                      showTimePicker === 'start' ? setStartH(String(v)) : setEndH(String(v))
                    }
                    testID="wheel-hour"
                  />
                  <Text style={styles.wheelSep}>:</Text>
                  <WheelPicker
                    items={MINS}
                    value={showTimePicker === 'start' ? startM : endM}
                    onChange={(v) =>
                      showTimePicker === 'start' ? setStartM(String(v)) : setEndM(String(v))
                    }
                    testID="wheel-min"
                  />
                  <WheelPicker
                    items={APS}
                    value={showTimePicker === 'start' ? startAp : endAp}
                    onChange={(v) =>
                      showTimePicker === 'start' ? setStartAp(String(v)) : setEndAp(String(v))
                    }
                    width={60}
                    testID="wheel-ampm"
                  />
                </View>
                <Pressable
                  style={styles.wheelDone}
                  onPress={() => {
                    haptic.medium();
                    setShowTimePicker(null);
                  }}
                >
                  <Text style={styles.wheelDoneText}>Done</Text>
                </Pressable>
              </Animated.View>
            )}

            {/* Repeat */}
            <Text style={styles.label}>Repeat</Text>
            <View style={styles.chipsRow}>
              {(['none', 'daily', 'weekly', 'monthly'] as Repeat[]).map((r) => {
                const active = repeat === r;
                return (
                  <Pressable
                    key={r}
                    onPress={() => {
                      haptic.selection();
                      setRepeat(r);
                    }}
                    style={[styles.chip, active && styles.chipActive]}
                    testID={`repeat-${r}`}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {r[0].toUpperCase() + r.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Reminder */}
            <Text style={styles.label}>Reminder</Text>
            <View style={styles.chipsRow}>
              {[0, 15, 30, 60].map((r) => {
                const active = reminder === r;
                return (
                  <Pressable
                    key={r}
                    onPress={() => {
                      haptic.selection();
                      setReminder(r);
                    }}
                    style={[styles.chip, active && styles.chipActive]}
                    testID={`reminder-${r}`}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {r === 0 ? 'None' : `${r} min`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ height: 24 }} />

            {/* Submit */}
            <Animated.View style={[submitStyle]}>
              <Pressable onPress={handleSubmit} style={styles.submit} testID="submit-task">
                <LinearGradient
                  colors={[colors.crimsonGlow, colors.crimson]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Animated.View
                  pointerEvents="none"
                  style={[styles.shimmerLayer, shimmerStyle]}
                />
                <Text style={styles.submitText}>
                  {submitting ? 'Creating…' : 'Create task'}
                </Text>
              </Pressable>
            </Animated.View>

            <View style={{ height: 24 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#000',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '92%',
    backgroundColor: colors.bgMid,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(229,57,53,0.25)',
    overflow: 'hidden',
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 6,
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: 2,
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 56,
    gap: 10,
    marginTop: 4,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  label: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 22,
    marginBottom: 10,
  },
  catChip: {
    width: 88,
    height: 92,
    borderRadius: 18,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  catLabel: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  catLabelActive: {
    color: '#fff',
    fontWeight: '700',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeBtn: {
    flex: 1,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    padding: 12,
  },
  timeLinkLine: {
    width: 12,
    height: 1.5,
    backgroundColor: colors.crimson,
    opacity: 0.6,
  },
  timeLabel: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  timeValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  wheelPicker: {
    marginTop: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: 14,
  },
  wheelTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  wheelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  wheelSep: {
    color: colors.crimsonGlow,
    fontSize: 22,
    fontWeight: '900',
    marginHorizontal: 4,
  },
  wheelDone: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.crimson,
  },
  wheelDoneText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: colors.glass,
  },
  chipActive: {
    borderColor: colors.crimson,
    backgroundColor: 'rgba(229,57,53,0.3)',
  },
  chipText: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '800',
  },
  submit: {
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  shimmerLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255,255,255,0.15)',
    transform: [{ skewX: '-20deg' }],
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
