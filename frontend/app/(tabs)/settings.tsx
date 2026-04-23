import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings as Gear } from 'lucide-react-native';
import { GradientBackground } from '../../src/components/GradientBackground';
import { AmbientParticles } from '../../src/components/AmbientParticles';
import { colors } from '../../src/theme/tokens';

export default function SettingsScreen() {
  return (
    <GradientBackground>
      <AmbientParticles count={5} />
      <SafeAreaView style={styles.wrap}>
        <View style={styles.center}>
          <View style={styles.iconWrap}>
            <Gear size={40} color={colors.crimsonGlow} strokeWidth={1.8} />
          </View>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.sub}>Profile, haptics, privacy — coming next</Text>
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
