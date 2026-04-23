import React, { useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, Platform, UIManager } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  withDelay,
  Easing,
  FadeInDown,
  runOnJS,
  useDerivedValue,
  SharedValue,
} from 'react-native-reanimated';
import {
  Canvas,
  Circle,
  Group,
  BlurMask,
} from '@shopify/react-native-skia';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { Check, Trash2, Briefcase, Heart, BookOpen, Users, Palette, LucideIcon } from 'lucide-react-native';
import { colors, categoryColors, spring, radius } from '../theme/tokens';
import { Task, CategoryKey } from '../store/types';
import { haptic } from '../hooks/useHaptics';
import { isSkiaSupported } from '../utils/skiaSupport';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const iconMap: Record<CategoryKey, LucideIcon> = {
  work: Briefcase,
  health: Heart,
  study: BookOpen,
  social: Users,
  creative: Palette,
};

interface Props {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const SWIPE_LEFT_REVEAL = -96;
const SWIPE_RIGHT_THRESHOLD = 80;

function Particle({
  idx,
  progress,
  color,
}: {
  idx: number;
  progress: SharedValue<number>;
  color: string;
}) {
  const angle = (idx / 8) * Math.PI * 2;
  const cxv = useDerivedValue(() => 40 + Math.cos(angle) * 30 * progress.value);
  const cyv = useDerivedValue(
    () => 40 + Math.sin(angle) * 30 * progress.value + 18 * progress.value * progress.value
  );
  const op = useDerivedValue(() => Math.max(0, 1 - progress.value));
  const rv = useDerivedValue(() => 3.5 * (1 - progress.value * 0.4));
  return <Circle cx={cxv} cy={cyv} r={rv} color={color} opacity={op} />;
}

function TaskCardImpl({ task, index, onToggle, onDelete }: Props) {
  const translateX = useSharedValue(0);
  const checkScale = useSharedValue(task.completed ? 1 : 0);
  const burst = useSharedValue(0);
  const flashBg = useSharedValue(0);

  const Icon = iconMap[task.category];

  useEffect(() => {
    checkScale.value = withSpring(task.completed ? 1 : 0, spring.bouncy);
  }, [task.completed, checkScale]);

  const triggerCompleteAnim = useCallback(() => {
    burst.value = 0;
    burst.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) });
    flashBg.value = withSequence(
      withTiming(1, { duration: 150 }),
      withDelay(300, withTiming(0, { duration: 600 }))
    );
  }, [burst, flashBg]);

  const handleToggle = useCallback(() => {
    if (!task.completed) {
      haptic.success();
      triggerCompleteAnim();
    } else {
      haptic.light();
    }
    onToggle(task.id);
  }, [task.completed, task.id, onToggle, triggerCompleteAnim]);

  const handleDelete = useCallback(() => {
    haptic.heavy();
    onDelete(task.id);
  }, [onDelete, task.id]);

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onChange((e) => {
      translateX.value = Math.max(-120, Math.min(140, e.translationX));
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_RIGHT_THRESHOLD) {
        translateX.value = withSpring(0, spring.default);
        runOnJS(handleToggle)();
      } else if (e.translationX < -SWIPE_RIGHT_THRESHOLD) {
        translateX.value = withSpring(SWIPE_LEFT_REVEAL, spring.default);
      } else {
        translateX.value = withSpring(0, spring.default);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashBg.value * 0.18,
  }));

  const strikeStyle = useAnimatedStyle(() => ({
    width: `${checkScale.value * 100}%` as `${number}%`,
  }));

  const checkFillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const priorityColor =
    task.priority === 'high'
      ? colors.priorityHigh
      : task.priority === 'medium'
      ? colors.priorityMed
      : colors.priorityLow;

  const time = (iso: string) => {
    const d = new Date(iso);
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:${m} ${ampm}`;
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(450).springify().damping(18)}
      style={styles.row}
    >
      {/* Delete reveal background */}
      <View style={styles.deleteBg}>
        <Pressable
          onPress={handleDelete}
          style={styles.deleteBtn}
          testID={`task-delete-${task.id}`}
        >
          <Trash2 size={20} color="#fff" />
        </Pressable>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.card, animatedStyle]} testID={`task-card-${task.id}`}>
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, styles.flashBg, flashStyle]}
          />

          {/* Checkbox */}
          <Pressable
            onPress={handleToggle}
            style={styles.checkboxWrap}
            testID={`task-toggle-${task.id}`}
            hitSlop={8}
          >
            <View style={styles.checkboxOuter}>
              <Animated.View style={[styles.checkboxFill, checkFillStyle]}>
                <Check size={14} color="#fff" strokeWidth={3} />
              </Animated.View>
            </View>
            <View pointerEvents="none" style={styles.burstWrap}>
              {isSkiaSupported ? (
                <Canvas style={styles.burstCanvas}>
                  <Group>
                    <BlurMask blur={3} style="solid" />
                    <Particle idx={0} progress={burst} color={categoryColors[task.category]} />
                    <Particle idx={1} progress={burst} color={colors.crimson} />
                    <Particle idx={2} progress={burst} color={categoryColors[task.category]} />
                    <Particle idx={3} progress={burst} color={colors.roseGold} />
                    <Particle idx={4} progress={burst} color={categoryColors[task.category]} />
                    <Particle idx={5} progress={burst} color={colors.crimsonGlow} />
                    <Particle idx={6} progress={burst} color={categoryColors[task.category]} />
                    <Particle idx={7} progress={burst} color={colors.roseGold} />
                  </Group>
                </Canvas>
              ) : null}
            </View>
          </Pressable>

          {/* Body */}
          <View style={styles.body}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.title, task.completed && styles.titleDim]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
              <Animated.View
                style={[styles.strike, strikeStyle]}
                pointerEvents="none"
              />
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.time}>
                {time(task.startTime)} — {time(task.endTime)}
              </Text>
              <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
              <View style={styles.catIcon}>
                <Icon size={13} color={categoryColors[task.category]} strokeWidth={2.5} />
              </View>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

export const TaskCard = React.memo(TaskCardImpl);

const styles = StyleSheet.create({
  row: {
    position: 'relative',
    marginBottom: 12,
  },
  deleteBg: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 96,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(229,57,53,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.4)',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 12,
  },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.crimson,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#140505',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.lg,
    padding: 14,
    overflow: 'hidden',
  },
  flashBg: {
    backgroundColor: colors.success,
    borderRadius: radius.lg,
  },
  checkboxWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  checkboxFill: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: colors.crimson,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burstWrap: {
    position: 'absolute',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  burstCanvas: {
    width: 80,
    height: 80,
  },
  body: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  titleDim: {
    color: colors.textDim,
  },
  strike: {
    position: 'absolute',
    left: 0,
    top: '50%',
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  time: {
    color: colors.textDim,
    fontSize: 12.5,
    marginRight: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  catIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
