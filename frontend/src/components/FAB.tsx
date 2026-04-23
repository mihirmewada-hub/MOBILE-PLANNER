import React, { useEffect, useState } from 'react';
import { StyleSheet, Pressable, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, X, Briefcase, Heart, BookOpen, Users, Palette, LucideIcon } from 'lucide-react-native';
import { colors, spring, categoryColors } from '../theme/tokens';
import { haptic } from '../hooks/useHaptics';
import { CategoryKey } from '../store/types';

interface Props {
  onSelectCategory: (c: CategoryKey) => void;
  size?: number;
}

const items: { key: CategoryKey; label: string; icon: LucideIcon; color: string }[] = [
  { key: 'work', label: 'Work', icon: Briefcase, color: categoryColors.work },
  { key: 'health', label: 'Health', icon: Heart, color: categoryColors.health },
  { key: 'study', label: 'Study', icon: BookOpen, color: categoryColors.study },
  { key: 'social', label: 'Social', icon: Users, color: categoryColors.social },
  { key: 'creative', label: 'Creative', icon: Palette, color: categoryColors.creative },
];

const RADIUS = 110;

export function FAB({ onSelectCategory, size = 60 }: Props) {
  const [open, setOpen] = useState(false);
  const breathe = useSharedValue(1);
  const pressScale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const menuProg = useSharedValue(0);
  const backdrop = useSharedValue(0);

  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1.06, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [breathe]);

  const handlePress = () => {
    haptic.medium();
    pressScale.value = withSpring(0.9, { damping: 12, stiffness: 400 });
    setTimeout(() => {
      pressScale.value = withSpring(1, spring.bouncy);
    }, 80);
    const next = !open;
    setOpen(next);
    rotate.value = withSpring(next ? 1 : 0, { damping: 14, stiffness: 220 });
    backdrop.value = withTiming(next ? 1 : 0, { duration: 220 });
    menuProg.value = withSpring(next ? 1 : 0, { damping: 12, stiffness: 180 });
  };

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value * pressScale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(rotate.value, [0, 1], [0, 45])}deg` }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdrop.value * 0.7,
    pointerEvents: backdrop.value > 0.05 ? 'auto' : 'none',
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value * 1.2 }],
    opacity: 0.35 + (breathe.value - 1) * 4,
  }));

  const handleCategoryPress = (k: CategoryKey) => {
    haptic.light();
    setOpen(false);
    rotate.value = withSpring(0, { damping: 14, stiffness: 220 });
    backdrop.value = withTiming(0, { duration: 220 });
    menuProg.value = withSpring(0, { damping: 12, stiffness: 180 });
    setTimeout(() => onSelectCategory(k), 160);
  };

  return (
    <>
      {/* Backdrop */}
      <Animated.View
        style={[StyleSheet.absoluteFillObject, styles.backdrop, backdropStyle]}
        pointerEvents={open ? 'auto' : 'none'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handlePress} />
      </Animated.View>

      {/* Menu items (positioned above FAB in arc) */}
      <View style={styles.menuAnchor} pointerEvents={open ? 'box-none' : 'none'}>
        {items.map((item, i) => {
          // arc from 200° to 340° (upper hemisphere pointing up)
          const start = 200;
          const endA = 340;
          const angleDeg = start + ((endA - start) / (items.length - 1)) * i;
          const angle = (angleDeg * Math.PI) / 180;
          const tx = Math.cos(angle) * RADIUS;
          const ty = Math.sin(angle) * RADIUS;

          return (
            <MenuItem
              key={item.key}
              index={i}
              menuProg={menuProg}
              tx={tx}
              ty={ty}
              label={item.label}
              color={item.color}
              Icon={item.icon}
              onPress={() => handleCategoryPress(item.key)}
            />
          );
        })}
      </View>

      {/* FAB */}
      <View style={[styles.fabWrap, { width: size, height: size }]} pointerEvents="box-none">
        <Animated.View style={[styles.glow, glowStyle]} pointerEvents="none" />
        <Animated.View style={[styles.fabAnim, fabStyle]}>
          <Pressable onPress={handlePress} style={styles.fab} testID="fab-create">
            <LinearGradient
              colors={[colors.crimsonGlow, colors.crimson]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Animated.View style={iconStyle}>
              {open ? <X size={24} color="#fff" strokeWidth={2.8} /> : <Plus size={26} color="#fff" strokeWidth={2.8} />}
            </Animated.View>
          </Pressable>
        </Animated.View>
      </View>
    </>
  );
}

function MenuItem({
  index,
  menuProg,
  tx,
  ty,
  label,
  color,
  Icon,
  onPress,
}: {
  index: number;
  menuProg: Animated.SharedValue<number>;
  tx: number;
  ty: number;
  label: string;
  color: string;
  Icon: LucideIcon;
  onPress: () => void;
}) {
  const style = useAnimatedStyle(() => {
    const p = menuProg.value;
    const delay = index * 0.08;
    const adj = Math.max(0, Math.min(1, (p - delay) / (1 - delay || 1)));
    return {
      transform: [
        { translateX: tx * adj },
        { translateY: ty * adj },
        { scale: adj },
      ],
      opacity: adj,
    };
  });

  return (
    <Animated.View style={[styles.menuItem, style]}>
      <Pressable onPress={onPress} style={styles.menuItemPress} testID={`fab-item-${label.toLowerCase()}`}>
        <View style={[styles.menuCircle, { borderColor: color + '88' }]}>
          <Icon size={22} color={color} strokeWidth={2.4} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: '#000',
  },
  fabWrap: {
    position: 'absolute',
    bottom: 18,
    left: 0,
    right: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.crimson,
    opacity: 0.35,
    shadowColor: colors.crimson,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 24,
  },
  fabAnim: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  fab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    overflow: 'hidden',
  },
  menuAnchor: {
    position: 'absolute',
    bottom: 48,
    left: '50%',
    alignItems: 'center',
  },
  menuItem: {
    position: 'absolute',
  },
  menuItemPress: {
    alignItems: 'center',
  },
  menuCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(20,5,5,0.85)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  menuLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.5,
  },
});
