import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, Heart, BookOpen, Users, Palette, Star, LucideIcon } from 'lucide-react-native';
import { colors, spring } from '../theme/tokens';
import { CategoryKey } from '../store/types';
import { haptic } from '../hooks/useHaptics';
import { useTheme } from '../theme/useTheme';

const iconMap: Record<string, LucideIcon> = {
  work: Briefcase,
  health: Heart,
  study: BookOpen,
  social: Users,
  creative: Palette,
};

interface Props {
  keyId: string;
  label: string;
  color: string;
  active: boolean;
  emoji?: string;
  onPress: () => void;
  testID?: string;
}

export function CategoryPill({ keyId, label, color, active, emoji, onPress, testID }: Props) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  const Icon = iconMap[keyId] ?? Star;
  const t = useTheme((s) => s.t);

  useEffect(() => {
    scale.value = withSpring(active ? 1.12 : 1, spring.bouncy);
    glow.value = withTiming(active ? 1 : 0, { duration: 260 });
  }, [active, scale, glow]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const handlePress = () => {
    haptic.light();
    onPress();
  };

  const iconColorInactive = t.mode === 'light' ? 'rgba(26,10,10,0.7)' : 'rgba(255,255,255,0.7)';
  const labelColorInactive = t.mode === 'light' ? 'rgba(26,10,10,0.65)' : 'rgba(255,255,255,0.7)';

  return (
    <Animated.View style={[styles.wrap, animStyle]}>
      <Pressable onPress={handlePress} style={styles.press} testID={testID}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.glowLayer, glowStyle]}>
          <LinearGradient
            colors={[color, colors.crimson]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
        <View style={[
          styles.inner,
          { backgroundColor: t.glass, borderColor: t.glassBorder },
          active && styles.innerActive,
        ]}>
          {emoji ? (
            <Text style={styles.emoji}>{emoji}</Text>
          ) : (
            <Icon
              size={22}
              color={active ? '#fff' : iconColorInactive}
              strokeWidth={active ? 2.4 : 2}
            />
          )}
          <Text style={[
            styles.label,
            { color: labelColorInactive },
            active && styles.labelActive,
          ]}>{label}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginRight: 10,
  },
  press: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  glowLayer: {
    borderRadius: 18,
  },
  inner: {
    minWidth: 84,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 18,
  },
  innerActive: {
    borderColor: 'rgba(255,82,82,0.5)',
    backgroundColor: 'transparent',
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
  },
  label: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  labelActive: {
    color: '#fff',
    fontWeight: '700',
  },
  emoji: {
    fontSize: 22,
    lineHeight: 26,
  },
});
