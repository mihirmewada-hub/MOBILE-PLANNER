import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Home, Calendar, BarChart3, Settings, LucideIcon } from 'lucide-react-native';
import { colors, spring } from '../../src/theme/tokens';
import { FAB } from '../../src/components/FAB';
import { haptic } from '../../src/hooks/useHaptics';
import { CategoryKey } from '../../src/store/types';

const tabsDef: { name: string; label: string; icon: LucideIcon }[] = [
  { name: 'index', label: 'Home', icon: Home },
  { name: 'calendar', label: 'Calendar', icon: Calendar },
  { name: 'analytics', label: 'Analytics', icon: BarChart3 },
  { name: 'settings', label: 'Settings', icon: Settings },
];

function CustomTabBar({ state, descriptors, navigation }: any) {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      {/* top glow line */}
      <View style={styles.topGlow} pointerEvents="none" />
      <View style={styles.bar}>
        {state.routes.map((route: any, index: number) => {
          if (route.name === 'create') return null;
          const def = tabsDef.find((t) => t.name === route.name);
          if (!def) return null;
          const focused = state.index === index;

          const tabNode = (
            <TabButton
              key={route.key}
              label={def.label}
              Icon={def.icon}
              focused={focused}
              onPress={() => {
                haptic.light();
                navigation.navigate(route.name);
              }}
              testID={`tab-${def.label.toLowerCase()}`}
            />
          );

          // Inject FAB slot between 2nd and 3rd visible tab
          if (index === 1) {
            return (
              <React.Fragment key={route.key}>
                {tabNode}
                <View key="fab-slot" style={styles.fabSlot}>
                  <FAB
                    onSelectCategory={(c: CategoryKey) => {
                      router.push(`/create?category=${c}`);
                    }}
                  />
                </View>
              </React.Fragment>
            );
          }
          return tabNode;
        })}
      </View>
    </View>
  );
}

function TabButton({
  label,
  Icon,
  focused,
  onPress,
  testID,
}: {
  label: string;
  Icon: LucideIcon;
  focused: boolean;
  onPress: () => void;
  testID?: string;
}) {
  const v = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    v.value = withSpring(focused ? 1 : 0, spring.bouncy);
  }, [focused, v]);

  const labelStyle = useAnimatedStyle(() => ({
    opacity: v.value,
    transform: [{ translateY: interpolate(v.value, [0, 1], [6, 0]) }],
  }));
  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: v.value }],
    opacity: v.value,
  }));
  const iconAnim = useAnimatedStyle(() => ({
    opacity: interpolate(v.value, [0, 1], [0.5, 1]),
    transform: [{ translateY: interpolate(v.value, [0, 1], [0, -2]) }],
  }));

  return (
    <Pressable onPress={onPress} style={styles.tab} testID={testID}>
      <Animated.View style={iconAnim}>
        <Icon size={22} color={focused ? colors.crimsonGlow : 'rgba(255,255,255,0.55)'} strokeWidth={2.2} />
      </Animated.View>
      <Animated.Text style={[styles.label, labelStyle]}>{label}</Animated.Text>
      <Animated.View style={[styles.dot, dotStyle]} />
    </Pressable>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bgBase },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="analytics" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    width: '100%',
    backgroundColor: 'rgba(10,0,0,0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(229,57,53,0.14)',
  },
  topGlow: {
    position: 'absolute',
    top: -2,
    left: '30%',
    right: '30%',
    height: 2,
    backgroundColor: colors.crimson,
    opacity: 0.35,
    shadowColor: colors.crimson,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  bar: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 22,
    paddingHorizontal: 6,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  fabSlot: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.crimsonGlow,
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.3,
  },
  dot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.crimsonGlow,
  },
});
