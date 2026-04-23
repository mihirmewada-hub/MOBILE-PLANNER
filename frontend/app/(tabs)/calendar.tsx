import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'lucide-react-native';
import { GradientBackground } from '../../src/components/GradientBackground';
import { AmbientParticles } from '../../src/components/AmbientParticles';
import { colors } from '../../src/theme/tokens';
import { useTheme } from '../../src/theme/useTheme';

export default function CalendarScreen() {
  const t = useTheme((s) => s.t);
  return (
    <GradientBackground>
      <AmbientParticles count={5} />
      <SafeAreaView style={styles.wrap}>
        <View style={styles.center}>
          <View style={[styles.iconWrap, { backgroundColor: t.mode === 'light' ? 'rgba(229,57,53,0.1)' : 'rgba(229,57,53,0.12)' }]}>
            <Calendar size={40} color={colors.crimsonGlow} strokeWidth={1.8} />
          </View>
          <Text style={[styles.title, { color: t.text }]}>Calendar</Text>
          <Text style={[styles.sub, { color: t.textDim }]}>Month & week views coming next</Text>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(229,57,53,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(229,57,53,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: colors.crimson,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  sub: {
    color: colors.textDim,
    marginTop: 8,
    fontSize: 14,
  },
});
