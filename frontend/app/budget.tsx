import React, { useMemo, useState } from 'react';
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
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Wallet, Plus, Trash2 } from 'lucide-react-native';
import { GradientBackground } from '../src/components/GradientBackground';
import { AmbientParticles } from '../src/components/AmbientParticles';
import { useTheme } from '../src/theme/useTheme';
import { useBudgetStore } from '../src/store/useBudgetStore';
import { haptic } from '../src/hooks/useHaptics';
import { colors, radius } from '../src/theme/tokens';

const CATEGORIES: { key: string; label: string; emoji: string; color: string }[] = [
  { key: 'food', label: 'Food', emoji: '🍔', color: '#FF8A80' },
  { key: 'transport', label: 'Transport', emoji: '🚗', color: '#64B5F6' },
  { key: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#BA68C8' },
  { key: 'bills', label: 'Bills', emoji: '📄', color: '#FFB74D' },
  { key: 'fun', label: 'Fun', emoji: '🎉', color: '#4CAF50' },
  { key: 'other', label: 'Other', emoji: '💳', color: '#E53935' },
];

export default function BudgetScreen() {
  const router = useRouter();
  const t = useTheme((s) => s.t);
  const { budget, setBudget, expenses, addExpense, removeExpense } = useBudgetStore();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState('food');
  const [editBudget, setEditBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(budget));

  const spent = useMemo(() => expenses.reduce((a, e) => a + e.amount, 0), [expenses]);
  const remaining = Math.max(0, budget - spent);
  const pct = Math.min(1, budget ? spent / budget : 0);

  const onAdd = () => {
    const n = parseFloat(amount);
    if (!title.trim() || !n || n <= 0) return;
    haptic.success();
    addExpense({ title: title.trim(), amount: n, category: cat });
    setTitle('');
    setAmount('');
  };

  const onSaveBudget = () => {
    const n = parseFloat(budgetInput);
    if (!isNaN(n) && n >= 0) {
      setBudget(n);
      haptic.success();
    }
    setEditBudget(false);
  };

  return (
    <GradientBackground>
      <AmbientParticles count={5} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.back} testID="budget-back">
              <ChevronLeft size={24} color={t.text} />
            </Pressable>
            <Text style={[styles.hTitle, { color: t.text }]}>Budget Planner</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Balance card */}
            <Animated.View
              entering={FadeIn.duration(500)}
              style={[styles.balanceCard]}
            >
              <LinearGradient
                colors={[colors.crimson, '#FF5252']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.balanceRow}>
                <View style={styles.balanceIcon}>
                  <Wallet size={22} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.balanceLabel}>Monthly budget</Text>
                  {editBudget ? (
                    <View style={styles.editRow}>
                      <Text style={styles.balanceBigPrefix}>$</Text>
                      <TextInput
                        value={budgetInput}
                        onChangeText={setBudgetInput}
                        keyboardType="numeric"
                        style={styles.balanceInput}
                        autoFocus
                        onSubmitEditing={onSaveBudget}
                        onBlur={onSaveBudget}
                        testID="budget-input"
                      />
                    </View>
                  ) : (
                    <Pressable onPress={() => { haptic.light(); setEditBudget(true); setBudgetInput(String(budget)); }} testID="budget-edit">
                      <Text style={styles.balanceBig}>${budget.toFixed(0)}</Text>
                    </Pressable>
                  )}
                </View>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
              </View>
              <View style={styles.balanceSplitRow}>
                <View>
                  <Text style={styles.balanceSubLabel}>Spent</Text>
                  <Text style={styles.balanceSubVal}>${spent.toFixed(0)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.balanceSubLabel}>Remaining</Text>
                  <Text style={styles.balanceSubVal}>${remaining.toFixed(0)}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Add expense form */}
            <Animated.View
              entering={FadeInDown.delay(120).duration(500)}
              style={[styles.card, { backgroundColor: t.glass, borderColor: t.glassBorder }]}
            >
              <Text style={[styles.cardTitle, { color: t.text }]}>Add expense</Text>
              <TextInput
                placeholder="Title (e.g. Lunch)"
                placeholderTextColor={t.textFaint}
                value={title}
                onChangeText={setTitle}
                style={[styles.input, { color: t.text, borderColor: t.glassBorder, backgroundColor: t.mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)' }]}
                testID="expense-title"
              />
              <TextInput
                placeholder="Amount"
                placeholderTextColor={t.textFaint}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={[styles.input, { color: t.text, borderColor: t.glassBorder, backgroundColor: t.mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)' }]}
                testID="expense-amount"
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                {CATEGORIES.map((c) => {
                  const active = cat === c.key;
                  return (
                    <Pressable
                      key={c.key}
                      onPress={() => { haptic.selection(); setCat(c.key); }}
                      style={[
                        styles.catPill,
                        { borderColor: active ? c.color : t.glassBorder, backgroundColor: active ? c.color + '26' : (t.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.04)') },
                      ]}
                      testID={`expense-cat-${c.key}`}
                    >
                      <Text style={styles.catEmoji}>{c.emoji}</Text>
                      <Text style={[styles.catLabel, { color: active ? c.color : t.textDim }]}>{c.label}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Pressable onPress={onAdd} style={styles.addBtn} testID="expense-add">
                <LinearGradient colors={[colors.crimsonGlow, colors.crimson]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
                <Plus size={18} color="#fff" strokeWidth={3} />
                <Text style={styles.addBtnText}>Add expense</Text>
              </Pressable>
            </Animated.View>

            {/* Expense list */}
            <Text style={[styles.sectionHeader, { color: colors.crimsonGlow }]}>RECENT</Text>
            {expenses.length === 0 ? (
              <View style={[styles.empty, { backgroundColor: t.glass, borderColor: t.glassBorder }]}>
                <Text style={[styles.emptyText, { color: t.textDim }]}>No expenses yet. Add one above 💸</Text>
              </View>
            ) : (
              expenses.map((e, i) => {
                const catDef = CATEGORIES.find((c) => c.key === e.category) ?? CATEGORIES[5];
                return (
                  <Animated.View
                    key={e.id}
                    entering={FadeInDown.delay(i * 40).duration(350)}
                    style={[styles.expenseRow, { backgroundColor: t.cardBg, borderColor: t.glassBorder }]}
                  >
                    <View style={[styles.expenseIcon, { backgroundColor: catDef.color + '26' }]}>
                      <Text style={{ fontSize: 20 }}>{catDef.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.expenseTitle, { color: t.text }]} numberOfLines={1}>{e.title}</Text>
                      <Text style={[styles.expenseMeta, { color: t.textDim }]}>{catDef.label}</Text>
                    </View>
                    <Text style={[styles.expenseAmount, { color: t.text }]}>-${e.amount.toFixed(0)}</Text>
                    <Pressable onPress={() => { haptic.heavy(); removeExpense(e.id); }} style={styles.delBtn} testID={`expense-del-${e.id}`}>
                      <Trash2 size={16} color={colors.crimson} />
                    </Pressable>
                  </Animated.View>
                );
              })
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  balanceCard: {
    borderRadius: radius.xl,
    padding: 18,
    overflow: 'hidden',
    marginTop: 4,
  },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  balanceIcon: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  balanceLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  balanceBig: { color: '#fff', fontSize: 36, fontWeight: '900', letterSpacing: -1, marginTop: 2 },
  balanceBigPrefix: { color: '#fff', fontSize: 28, fontWeight: '800', marginRight: 2, marginTop: 2 },
  editRow: { flexDirection: 'row', alignItems: 'center' },
  balanceInput: {
    color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -1,
    minWidth: 120, paddingVertical: 0,
  },
  progressBg: {
    height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.2)', marginTop: 14, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: 'rgba(255,255,255,0.9)',
  },
  balanceSplitRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 12,
  },
  balanceSubLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  balanceSubVal: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 2 },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginTop: 8,
  },
  catPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1,
    marginRight: 8,
  },
  catEmoji: { fontSize: 16, marginRight: 6 },
  catLabel: { fontSize: 13, fontWeight: '700' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    marginTop: 14,
    overflow: 'hidden',
  },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  sectionHeader: { fontSize: 11, fontWeight: '800', letterSpacing: 1.6, marginTop: 22, marginBottom: 8, marginLeft: 4 },
  empty: { padding: 22, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center' },
  emptyText: { fontSize: 13 },
  expenseRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: radius.lg,
    padding: 12, marginBottom: 10, gap: 12,
  },
  expenseIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  expenseTitle: { fontSize: 15, fontWeight: '700' },
  expenseMeta: { fontSize: 11.5, marginTop: 2 },
  expenseAmount: { fontSize: 15, fontWeight: '800', marginRight: 6 },
  delBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(229,57,53,0.12)' },
});
