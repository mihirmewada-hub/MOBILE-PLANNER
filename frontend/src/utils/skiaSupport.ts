import { Platform } from 'react-native';

// Returns true if Skia Canvas should actually render (native only for now).
// On web, we render lightweight fallbacks to keep preview working.
export const isSkiaSupported = Platform.OS !== 'web';
