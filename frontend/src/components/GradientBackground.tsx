import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function GradientBackground({ children, style }: Props) {
  const t = useTheme((s) => s.t);
  return (
    <View style={[{ flex: 1, backgroundColor: t.bgBase }, style]}>
      <LinearGradient
        colors={[t.bgTop, t.bgMid, t.bgBottom]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}
