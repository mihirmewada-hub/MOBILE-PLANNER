import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { colors } from '../theme/tokens';
import { haptic } from '../hooks/useHaptics';

interface Props {
  items: (string | number)[];
  value: string | number;
  onChange: (v: string | number) => void;
  width?: number;
  testID?: string;
}

const ITEM_H = 44;
const VISIBLE = 5;

export function WheelPicker({ items, value, onChange, width = 70, testID }: Props) {
  const ref = useRef<FlatList>(null);
  const lastIdx = useRef(-1);
  const height = ITEM_H * VISIBLE;

  const selectedIndex = Math.max(0, items.findIndex((x) => x === value));

  useEffect(() => {
    // scroll to position on mount / when value changes externally
    ref.current?.scrollToOffset({
      offset: selectedIndex * ITEM_H,
      animated: false,
    });
    lastIdx.current = selectedIndex;
  }, [selectedIndex]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / ITEM_H);
    if (idx !== lastIdx.current && idx >= 0 && idx < items.length) {
      lastIdx.current = idx;
      haptic.selection();
    }
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / ITEM_H);
    if (idx >= 0 && idx < items.length) {
      onChange(items[idx]);
    }
  };

  return (
    <View style={[styles.wrap, { width, height }]} testID={testID}>
      <View pointerEvents="none" style={styles.centerBand} />
      <FlatList
        ref={ref}
        data={items}
        keyExtractor={(item) => String(item)}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
        bounces
        contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
        getItemLayout={(_, i) => ({ length: ITEM_H, offset: i * ITEM_H, index: i })}
        renderItem={({ item, index }) => {
          const active = index === selectedIndex;
          return (
            <View style={styles.item}>
              <Text style={[styles.text, active && styles.activeText]}>{String(item)}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    overflow: 'hidden',
  },
  centerBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: ITEM_H * 2,
    height: ITEM_H,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(229,57,53,0.55)',
    backgroundColor: 'rgba(229,57,53,0.08)',
    borderRadius: 6,
    zIndex: 1,
    shadowColor: colors.crimson,
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  item: {
    height: ITEM_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '500',
  },
  activeText: {
    color: colors.crimsonGlow,
    fontSize: 22,
    fontWeight: '800',
    textShadowColor: 'rgba(229,57,53,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
