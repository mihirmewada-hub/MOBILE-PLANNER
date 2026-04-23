export const colors = {
  // Backgrounds
  bgBase: '#050000',
  bgTop: '#0a0000',
  bgMid: '#1a0505',
  bgBottom: '#0d0000',

  // Brand
  crimson: '#E53935',
  crimsonGlow: '#FF5252',
  roseGold: '#FF8A80',

  // Surfaces
  glass: 'rgba(255,255,255,0.03)',
  glassStrong: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,82,82,0.08)',
  glassBorderStrong: 'rgba(255,82,82,0.18)',

  // Text
  text: '#FFFFFF',
  textDim: 'rgba(255,255,255,0.6)',
  textFaint: 'rgba(255,255,255,0.35)',

  // Semantic
  success: '#4CAF50',
  warning: '#FFB74D',
  danger: '#E53935',

  // Priority
  priorityHigh: '#E53935',
  priorityMed: '#FFB74D',
  priorityLow: '#4CAF50',
};

export const categoryColors: Record<string, string> = {
  work: '#E53935',
  health: '#4CAF50',
  study: '#64B5F6',
  social: '#FFB74D',
  creative: '#BA68C8',
};

export const spring = {
  default: { damping: 15, stiffness: 150, mass: 1 },
  bouncy: { damping: 12, stiffness: 200, mass: 0.8 },
  gentle: { damping: 20, stiffness: 100, mass: 1.2 },
  snappy: { damping: 25, stiffness: 300, mass: 0.5 },
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
