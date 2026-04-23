import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Clock,
  RefreshCw,
  Sun,
  Moon,
  Cloud,
  Download,
  Trash2,
  ChevronRight,
  Sunrise,
} from 'lucide-react-native';
import { GradientBackground } from '../../src/components/GradientBackground';
import { AmbientParticles } from '../../src/components/AmbientParticles';
import { TimePickerSheet } from '../../src/components/TimePickerSheet';
import { colors, radius, spring } from '../../src/theme/tokens';
import { useTheme } from '../../src/theme/useTheme';
import { haptic } from '../../src/hooks/useHaptics';

const REMINDER_OPTIONS = [0, 15, 30, 60];

export default function SettingsScreen() {
  const [defaultReminder, setDefaultReminder] = useState<number>(15);
  const [streakReset, setStreakReset] = useState<string>('12:00 AM');
  const [dayStart, setDayStart] = useState<string>('3:00 PM');
  const [dayEnd, setDayEnd] = useState<string>('6:00 AM');
  const [cloudBackup, setCloudBackup] = useState<boolean>(true);
  const themeMode = useTheme((s) => s.mode);
  const toggleTheme = useTheme((s) => s.toggle);
  const tc = useTheme((s) => s.t);

  // Which time picker is open
  const [picker, setPicker] = useState<null | 'streak' | 'start' | 'end'>(null);

  // day start percent of 24h (3 PM = 15:00 => 62.5%)
  const startPct = timeToPct(dayStart);
  const endPct = timeToPct(dayEnd);
  const { activeHours, sleepHours } = computeWindow(dayStart, dayEnd);

  const cycleReminder = () => {
    haptic.selection();
    const idx = REMINDER_OPTIONS.indexOf(defaultReminder);
    const next = REMINDER_OPTIONS[(idx + 1) % REMINDER_OPTIONS.length];
    setDefaultReminder(next);
  };

  const onExport = () => {
    haptic.medium();
    if (Platform.OS === 'web') {
      window.alert('Export started — your data has been prepared.');
    } else {
      Alert.alert('Export Data', 'Your data has been prepared for export.');
    }
  };

  const onClear = () => {
    haptic.heavy();
    if (Platform.OS === 'web') {
      if (window.confirm('Clear all local data? This cannot be undone.')) {
        window.alert('All data cleared.');
      }
      return;
    }
    Alert.alert('Clear all data?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => haptic.success() },
    ]);
  };

  const pickerTitle =
    picker === 'start'
      ? 'Start time'
      : picker === 'end'
      ? 'End time'
      : 'Streak reset';

  const pickerValue =
    picker === 'start' ? dayStart : picker === 'end' ? dayEnd : streakReset;

  const onPickerConfirm = (value: string) => {
    if (picker === 'start') setDayStart(value);
    else if (picker === 'end') setDayEnd(value);
    else if (picker === 'streak') setStreakReset(value);
    setPicker(null);
  };

  const displayStreak =
    streakReset === '12:00 AM' ? 'Midnight' : streakReset;

  return (
    <GradientBackground>
      <AmbientParticles count={6} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Animated.Text entering={FadeIn.duration(400)} style={[styles.title, { color: tc.text }]}>
            Settings
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.duration(400).delay(80)}
            style={[styles.subtitle, { color: tc.textDim }]}
          >
            Customise your experience
          </Animated.Text>

          {/* Appearance */}
          <SectionHeader title="APPEARANCE" />
          <Animated.View
            entering={FadeInDown.delay(80).duration(500)}
            style={styles.group}
          >
            <Pressable onPress={() => { haptic.light(); toggleTheme(); }} style={styles.row} testID="setting-theme">
              <View style={styles.rowLeft}>
                <View style={styles.iconCircle}>
                  {themeMode === 'light' ? (
                    <Sunrise size={18} color="#FFB74D" strokeWidth={2} />
                  ) : (
                    <Moon size={18} color="#64B5F6" strokeWidth={2} />
                  )}
                </View>
                <View>
                  <Text style={[styles.rowLabel, { color: tc.text }]}>Theme</Text>
                  <Text style={[styles.rowSub, { color: tc.textDim }]}>
                    {themeMode === 'light' ? 'Light — vibrant & airy' : 'Dark — crimson noir'}
                  </Text>
                </View>
              </View>
              <View style={styles.themePill}>
                <View
                  style={[
                    styles.themeOption,
                    themeMode === 'dark' && styles.themeOptionActive,
                  ]}
                >
                  <Moon size={14} color={themeMode === 'dark' ? '#fff' : 'rgba(255,255,255,0.5)'} />
                </View>
                <View
                  style={[
                    styles.themeOption,
                    themeMode === 'light' && styles.themeOptionActiveLight,
                  ]}
                >
                  <Sun size={14} color={themeMode === 'light' ? '#1A0A0A' : 'rgba(255,255,255,0.5)'} />
                </View>
              </View>
            </Pressable>
          </Animated.View>

          {/* Planner group */}
          <Animated.View
            entering={FadeInDown.delay(150).duration(500)}
            style={[styles.group, { backgroundColor: tc.glass, borderColor: tc.glassBorder }]}
          >
            <Row
              icon={<Clock size={18} color={colors.crimsonGlow} strokeWidth={2} />}
              label="Default Reminder"
              value={defaultReminder === 0 ? 'Off' : `${defaultReminder} min`}
              onPress={cycleReminder}
              testID="setting-reminder"
              tc={tc}
            />
            <Divider tc={tc} />
            <Row
              icon={<RefreshCw size={18} color={colors.crimsonGlow} strokeWidth={2} />}
              label="Streak Reset Time"
              value={displayStreak}
              onPress={() => {
                haptic.light();
                setPicker('streak');
              }}
              testID="setting-streak-reset"
              tc={tc}
            />
          </Animated.View>

          <SectionHeader title="MY DAY WINDOW" />

          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={[styles.group, { backgroundColor: tc.glass, borderColor: tc.glassBorder }]}
          >
            <TimeRow
              icon={<Sun size={18} color="#FFB74D" strokeWidth={2} />}
              label="Day Starts"
              sublabel="When your day begins"
              value={dayStart}
              onPress={() => {
                haptic.light();
                setPicker('start');
              }}
              testID="setting-day-starts"
              tc={tc}
            />
            <Divider tc={tc} />
            <TimeRow
              icon={<Moon size={18} color="#64B5F6" strokeWidth={2} />}
              label="Day Ends"
              sublabel="When you wind down"
              value={dayEnd}
              onPress={() => {
                haptic.light();
                setPicker('end');
              }}
              testID="setting-day-ends"
              tc={tc}
            />

            <DayTimeline
              startPct={startPct}
              endPct={endPct}
              activeLabel={`${activeHours}h active · ${sleepHours}h sleep`}
              tc={tc}
            />
          </Animated.View>

          <SectionHeader title="DATA & PRIVACY" />

          <Animated.View
            entering={FadeInDown.delay(450).duration(500)}
            style={[styles.group, { backgroundColor: tc.glass, borderColor: tc.glassBorder }]}
          >
            <ToggleRow
              icon={<Cloud size={18} color={colors.crimsonGlow} strokeWidth={2} />}
              label="Cloud Backup"
              value={cloudBackup}
              onChange={(v) => {
                haptic.light();
                setCloudBackup(v);
              }}
              testID="setting-cloud-backup"
              tc={tc}
            />
            <Divider tc={tc} />
            <NavRow
              icon={<Download size={18} color={colors.crimsonGlow} strokeWidth={2} />}
              label="Export Data"
              onPress={onExport}
              testID="setting-export"
              tc={tc}
            />
            <Divider tc={tc} />
            <NavRow
              icon={<Trash2 size={18} color={colors.crimson} strokeWidth={2} />}
              label="Clear All Data"
              danger
              onPress={onClear}
              testID="setting-clear"
              tc={tc}
            />
          </Animated.View>

          <View style={styles.footer}>
            <Text style={[styles.footerTitle, { color: tc.textDim }]}>Day Planner v1.0 — Red Edition</Text>
            <Text style={[styles.footerSub, { color: tc.textFaint }]}>Made with ❤️</Text>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      <TimePickerSheet
        visible={picker !== null}
        title={pickerTitle}
        initial={pickerValue}
        onClose={() => setPicker(null)}
        onConfirm={onPickerConfirm}
      />
    </GradientBackground>
  );
}

// ---------- helpers ----------
function timeToPct(time: string): number {
  // expects "HH:MM AM/PM"
  const m = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  const mins = parseInt(m[2], 10);
  return ((h * 60 + mins) / (24 * 60));
}

function computeWindow(startStr: string, endStr: string) {
  const s = timeToPct(startStr) * 24;
  const e = timeToPct(endStr) * 24;
  let active = e - s;
  if (active <= 0) active += 24;
  const sleep = 24 - active;
  return {
    activeHours: Math.round(active),
    sleepHours: Math.round(sleep),
  };
}

// ---------- subcomponents ----------
function SectionHeader({ title }: { title: string }) {
  return (
    <Animated.Text
      entering={FadeIn.duration(400)}
      style={styles.sectionHeader}
    >
      {title}
    </Animated.Text>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
  testID,
  tc,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress: () => void;
  testID?: string;
  tc: any;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <Pressable
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.98, spring.snappy))}
        onPressOut={() => (scale.value = withSpring(1, spring.bouncy))}
        style={styles.row}
        testID={testID}
      >
        <View style={styles.rowLeft}>
          <View style={[styles.iconCircle, { backgroundColor: tc.glassStrong, borderColor: tc.glassBorder }]}>{icon}</View>
          <Text style={[styles.rowLabel, { color: tc.text }]}>{label}</Text>
        </View>
        <View style={styles.rowRight}>
          <Text style={styles.rowValue}>{value}</Text>
          <ChevronRight size={16} color={tc.textFaint} style={{ marginLeft: 4 }} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

function TimeRow({
  icon,
  label,
  sublabel,
  value,
  onPress,
  testID,
  tc,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  value: string;
  onPress: () => void;
  testID?: string;
  tc: any;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={style}>
      <Pressable
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.98, spring.snappy))}
        onPressOut={() => (scale.value = withSpring(1, spring.bouncy))}
        style={styles.row}
        testID={testID}
      >
        <View style={styles.rowLeft}>
          <View style={[styles.iconCircle, { backgroundColor: tc.glassStrong, borderColor: tc.glassBorder }]}>{icon}</View>
          <View>
            <Text style={[styles.rowLabel, { color: tc.text }]}>{label}</Text>
            <Text style={[styles.rowSub, { color: tc.textDim }]}>{sublabel}</Text>
          </View>
        </View>
        <View style={styles.valuePill}>
          <Text style={styles.valuePillText}>{value}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onChange,
  testID,
  tc,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  testID?: string;
  tc: any;
}) {
  const anim = useSharedValue(value ? 1 : 0);
  React.useEffect(() => {
    anim.value = withSpring(value ? 1 : 0, { damping: 15, stiffness: 220 });
  }, [value, anim]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(anim.value, [0, 1], [2, 22]) }],
  }));
  const trackOnStyle = useAnimatedStyle(() => ({
    opacity: anim.value,
  }));

  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={styles.row}
      testID={testID}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconCircle, { backgroundColor: tc.glassStrong, borderColor: tc.glassBorder }]}>{icon}</View>
        <Text style={[styles.rowLabel, { color: tc.text }]}>{label}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: tc.mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)', borderColor: tc.mode === 'light' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)' }]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.trackOn, trackOnStyle]}>
          <LinearGradient
            colors={[colors.crimsonGlow, colors.crimson]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </View>
    </Pressable>
  );
}

function NavRow({
  icon,
  label,
  onPress,
  danger,
  testID,
  tc,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
  testID?: string;
  tc: any;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={style}>
      <Pressable
        onPress={onPress}
        onPressIn={() => (scale.value = withSpring(0.98, spring.snappy))}
        onPressOut={() => (scale.value = withSpring(1, spring.bouncy))}
        style={styles.row}
        testID={testID}
      >
        <View style={styles.rowLeft}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: tc.glassStrong, borderColor: tc.glassBorder },
              danger && { backgroundColor: 'rgba(229,57,53,0.12)', borderColor: 'rgba(229,57,53,0.3)' },
            ]}
          >
            {icon}
          </View>
          <Text style={[styles.rowLabel, { color: tc.text }, danger && styles.rowLabelDanger]}>{label}</Text>
        </View>
        <ChevronRight size={18} color={danger ? colors.crimson : tc.textFaint} />
      </Pressable>
    </Animated.View>
  );
}

function Divider({ tc }: { tc: any }) {
  return <View style={[styles.divider, { backgroundColor: tc.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)' }]} />;
}

function DayTimeline({
  startPct,
  endPct,
  activeLabel,
  tc,
}: {
  startPct: number;
  endPct: number;
  activeLabel: string;
  tc: any;
}) {
  // barWidth filled with gradient from start to end. Handle wrap.
  const wraps = endPct <= startPct;
  // For simplicity on web, show two segments if wraps
  return (
    <View style={styles.timeline}>
      <View style={styles.timelineLabelRow}>
        <Text style={[styles.timelineSide, { color: tc.textFaint }]}>In Sleep</Text>
        <Text style={[styles.timelineMain, { color: tc.text }]}>{activeLabel}</Text>
        <Text style={[styles.timelineSide, { color: tc.textFaint }]}>In Sleep</Text>
      </View>
      <View style={[styles.timelineBar, { backgroundColor: tc.mode === 'light' ? 'rgba(229,57,53,0.1)' : 'rgba(255,255,255,0.06)' }]}>
        {wraps ? (
          <>
            <LinearGradient
              colors={[colors.crimson, colors.crimsonGlow]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.timelineFill, { left: `${startPct * 100}%`, width: `${(1 - startPct) * 100}%` }]}
            />
            <LinearGradient
              colors={[colors.crimsonGlow, colors.roseGold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.timelineFill, { left: '0%', width: `${endPct * 100}%` }]}
            />
          </>
        ) : (
          <LinearGradient
            colors={[colors.crimson, colors.crimsonGlow, colors.roseGold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.timelineFill, { left: `${startPct * 100}%`, width: `${(endPct - startPct) * 100}%` }]}
          />
        )}
      </View>
      <View style={styles.timelineAxis}>
        {['12 AM', '6 AM', '12 PM', '6 PM', '12 AM'].map((t) => (
          <Text key={t} style={[styles.axisLabel, { color: tc.textFaint }]}>
            {t}
          </Text>
        ))}
      </View>
    </View>
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
    textShadowColor: 'rgba(229,57,53,0.4)',
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20,
  },
  group: {
    backgroundColor: 'rgba(229,57,53,0.06)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.18)',
    overflow: 'hidden',
  },
  sectionHeader: {
    color: colors.crimsonGlow,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 64,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 14,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  rowLabelDanger: {
    color: colors.crimson,
    fontWeight: '700',
  },
  rowSub: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  rowValue: {
    color: colors.crimsonGlow,
    fontSize: 14,
    fontWeight: '700',
  },
  valuePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.35)',
    backgroundColor: 'rgba(229,57,53,0.12)',
  },
  valuePillText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginLeft: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  trackOn: {
    borderRadius: 14,
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  timeline: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 4,
  },
  timelineLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timelineSide: {
    color: colors.textFaint,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  timelineMain: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  timelineBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    position: 'relative',
  },
  timelineFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 4,
  },
  timelineAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  axisLabel: {
    color: colors.textFaint,
    fontSize: 10,
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerTitle: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '600',
  },
  footerSub: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 4,
  },
  themePill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 999,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.25)',
  },
  themeOption: {
    width: 36,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeOptionActive: {
    backgroundColor: colors.crimson,
    shadowColor: colors.crimson,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  themeOptionActiveLight: {
    backgroundColor: '#FFD54F',
    shadowColor: '#FFB74D',
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
});
