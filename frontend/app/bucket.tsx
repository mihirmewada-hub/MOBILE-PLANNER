import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ListChecks, Plus, Trash2, Check } from 'lucide-react-native';
import { GradientBackground } from '../src/components/GradientBackground';
import { AmbientParticles } from '../src/components/AmbientParticles';
import { useTheme } from '../src/theme/useTheme';
import { useBucketStore } from '../src/store/useBucketStore';
import { haptic } from '../src/hooks/useHaptics';
import { colors, radius } from '../src/theme/tokens';

const EMOJI_OPTS = ['🌍', '🏔️', '🎯', '✨', '🎨', '📚', '💪', '🏄', '🎸', '🚀', '❤️', '🧘'];

export default function BucketScreen() {
  const router = useRouter();
  const t = useTheme((s) => s.t);
  const { items, addItem, toggleItem, removeItem } = useBucketStore();

  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('🎯');

  const done = items.filter((i) => i.done).length;
  const total = items.length;

  const onAdd = () => {
    if (!title.trim()) return;
    haptic.success();
    addItem({ title: title.trim(), emoji });
    setTitle('');
  };

  return (
    <GradientBackground>
      <AmbientParticles count={6} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.back} testID="bucket-back">
              <ChevronLeft size={24} color={t.text} />
            </Pressable>
            <Text style={[styles.hTitle, { color: t.text }]}>Bucket List</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Hero card */}
            <Animated.View entering={FadeIn.duration(500)} style={styles.hero}>
              <LinearGradient
                colors={['#FFB74D', '#FB8C00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.heroIcon}>
                <ListChecks size={26} color="#fff" strokeWidth={2.4} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>Dreams & goals</Text>
                <Text style={styles.heroSub}>
                  {total === 0 ? 'Start adding what you want to do' : `${done} of ${total} accomplished`}
                </Text>
              </View>
              <Text style={styles.heroCount}>{total}</Text>
            </Animated.View>

            {/* Add form */}
            <Animated.View
              entering={FadeInDown.delay(120).duration(500)}
              style={[styles.card, { backgroundColor: t.glass, borderColor: t.glassBorder }]}
            >
              <Text style={[styles.cardTitle, { color: t.text }]}>Add to your list</Text>
              <TextInput
                placeholder="e.g. See the northern lights"
                placeholderTextColor={t.textFaint}
                value={title}
                onChangeText={setTitle}
                style={[styles.input, { color: t.text, borderColor: t.glassBorder, backgroundColor: t.mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)' }]}
                testID="bucket-title"
                onSubmitEditing={onAdd}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                {EMOJI_OPTS.map((e) => {
                  const active = emoji === e;
                  return (
                    <Pressable
                      key={e}
                      onPress={() => { haptic.selection(); setEmoji(e); }}
                      style={[
                        styles.emojiPill,
                        {
                          backgroundColor: active ? colors.crimson : (t.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)'),
                          borderColor: active ? colors.crimson : t.glassBorder,
                        },
                      ]}
                      testID={`bucket-emoji-${e}`}
                    >
                      <Text style={{ fontSize: 20 }}>{e}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Pressable onPress={onAdd} style={styles.addBtn} testID="bucket-add">
                <LinearGradient colors={[colors.crimsonGlow, colors.crimson]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                <Plus size={18} color="#fff" strokeWidth={3} />
                <Text style={styles.addBtnText}>Add goal</Text>
              </Pressable>
            </Animated.View>

            {/* List */}
            <Text style={[styles.sectionHeader, { color: colors.crimsonGlow }]}>MY GOALS</Text>
            {items.length === 0 ? (
              <View style={[styles.empty, { backgroundColor: t.glass, borderColor: t.glassBorder }]}>
                <Text style={[styles.emptyText, { color: t.textDim }]}>Empty list. Dream big ✨</Text>
              </View>
            ) : (
              items.map((it, i) => (
                <Animated.View
                  key={it.id}
                  entering={FadeInDown.delay(i * 40).duration(350)}
                  layout={Layout.springify()}
                  style={[styles.itemRow, { backgroundColor: t.cardBg, borderColor: t.glassBorder }]}
                >
                  <Pressable
                    onPress={() => { haptic.light(); toggleItem(it.id); }}
                    style={[
                      styles.check,
                      it.done && { backgroundColor: colors.crimson, borderColor: colors.crimson },
                    ]}
                    testID={`bucket-toggle-${it.id}`}
                  >
                    {it.done ? <Check size={14} color="#fff" strokeWidth={3} /> : null}
                  </Pressable>
                  <Text style={styles.itemEmoji}>{it.emoji}</Text>
                  <Text
                    style={[
                      styles.itemTitle,
                      { color: t.text },
                      it.done && { textDecorationLine: 'line-through', color: t.textDim },
                    ]}
                    numberOfLines={2}
                  >{it.title}</Text>
                  <Pressable onPress={() => { haptic.heavy(); removeItem(it.id); }} style={styles.delBtn} testID={`bucket-del-${it.id}`}>
                    <Trash2 size={16} color={colors.crimson} />
                  </Pressable>
                </Animated.View>
              ))
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  hTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  hero: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: radius.xl, padding: 18, overflow: 'hidden',
    marginTop: 4,
  },
  heroIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5, marginTop: 3, fontWeight: '600' },
  heroCount: { color: '#fff', fontSize: 44, fontWeight: '900', letterSpacing: -1 },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1, padding: 16, marginTop: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  input: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15,
  },
  emojiPill: {
    width: 44, height: 44, borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 48, borderRadius: 14, marginTop: 14, overflow: 'hidden',
  },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  sectionHeader: { fontSize: 11, fontWeight: '800', letterSpacing: 1.6, marginTop: 22, marginBottom: 8, marginLeft: 4 },
  empty: { padding: 22, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center' },
  emptyText: { fontSize: 13 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: radius.lg,
    padding: 12, marginBottom: 10, gap: 10,
  },
  check: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: 'rgba(150,150,150,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  itemEmoji: { fontSize: 22 },
  itemTitle: { flex: 1, fontSize: 15, fontWeight: '600' },
  delBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(229,57,53,0.12)' },
});
