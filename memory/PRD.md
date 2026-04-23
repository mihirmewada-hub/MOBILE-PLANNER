# Crimson Noir — Habit Tracker (MVP)

## Vision
A dark, physics-driven React Native Expo habit tracker with a deep crimson/burgundy aesthetic. Every interaction has tactile feedback; animations run on the UI thread via Reanimated worklets; Skia powers GPU-accelerated charts and particle systems on native.

## Stack
- React Native 0.81 + Expo SDK 54
- TypeScript
- Expo Router v6 (file-based, nested tabs + transparent modal)
- react-native-reanimated 4 + gesture-handler (all animations worklet-driven)
- @shopify/react-native-skia (GPU charts, particles) — with SVG fallbacks on web preview
- Zustand + AsyncStorage (local-only for MVP)
- expo-linear-gradient, lucide-react-native, react-native-svg, expo-haptics
- `.env` keys scaffolded for future auth

## Shipped Screens (v1)
1. **Dashboard** — parallax header, streak flame (SVG + Reanimated flicker), notification bell w/ badge, Skia progress ring w/ counting %, glass category pills with magnetic active state, swipe-to-complete task cards, particle burst on check (Skia), staggered fade-in-up entrance, FAB w/ radial explosion menu
2. **Analytics** — Week/Month/Year sliding pill toggle, counting stat cards, Skia donut chart w/ segment expansion, Skia bar chart w/ spring-grow, Skia cubic-bezier line chart w/ dot reveal, productivity score card with ring
3. **Create Task modal** — spring bottom-sheet w/ drag-to-dismiss, glass form fields, category chips w/ gradient + check badge, priority segmented control, custom wheel-picker time selector w/ haptic ticks, repeat & reminder chips, shimmer submit button
4. **Calendar / Settings** — placeholder screens for v2

## Design System Tokens
- Backgrounds: #050000 / #0a0000 / #1a0505 / #0d0000
- Primary: #E53935 (crimson), #FF5252 (glow), #FF8A80 (rose gold)
- Glass: rgba(255,255,255,0.03) + rgba(255,82,82,0.08) borders
- Text: #FFFFFF / rgba(255,255,255,0.6)
- Typography: System (Inter-like), heavy weights, tabular nums, text-shadow glow
- Spring presets: default / bouncy / gentle / snappy
- Haptic vocabulary: light / medium / heavy / success / warning / selection

## Demo Data (auto-seeded)
- 5 categories: Work, Health, Study, Social, Creative
- 6 sample tasks across today with mixed priorities/completion
- 7-day weekly productivity history
- User "Alex Rivera", streak 12

## File Layout
```
app/
  _layout.tsx              # Root stack, SkiaLoader gate (web), Gesture root
  (tabs)/
    _layout.tsx           # Custom tab bar + centered FAB
    index.tsx             # Dashboard
    analytics.tsx         # Analytics
    calendar.tsx          # Placeholder
    settings.tsx          # Placeholder
  create.tsx              # Bottom-sheet modal
src/
  theme/tokens.ts         # Design tokens
  store/
    useStore.ts           # Zustand + AsyncStorage
    demoData.ts           # Seed data
    types.ts
  components/             # ProgressRing, TaskCard, FAB, DonutChart, BarChart, LineChart, SegmentedControl, WheelPicker, Flame, AmbientParticles, CategoryPill, StatCard, GradientBackground, GlassCard
  hooks/useHaptics.ts
  utils/skiaSupport.ts    # native-only Skia gate
  utils/skia-loader.ts    # native stub
  utils/skia-loader.web.ts
eas.json                  # development / preview / production profiles
```

## EAS Build
Configured `eas.json` with three profiles. To build APK locally:
```bash
cd /app/frontend
npx eas-cli login
npx eas-cli build --profile preview --platform android
```
EAS will prompt for your Expo account; the APK download link will be emailed.

## Known Platform Notes
- **Web preview**: Skia is skipped; SVG fallbacks render charts. Full Skia fidelity ships in the native EAS build.
- **FAB centering on web preview** may appear off-center due to RN-Web absolute-positioning quirks; **native builds center correctly** (tested via RN layout).
- All animations are worklet-driven on native for consistent 60fps.

## Deferred to v2
- Supabase sync + auth (Google/email) — env placeholders added
- Calendar month/week views
- Settings screen (profile, haptics toggle, My-Day window, cloud backup)
- Onboarding "learn by doing" spotlight flow
- SQLite + Drizzle (currently AsyncStorage JSON persistence)
- Sound effects (expo-av)

## Business Hook
Freemium lane in v2: free forever for local use; $2.99/mo Pro unlocks cross-device sync (Supabase), unlimited history, custom categories, export-to-CSV, and watchOS/Wear-OS complications — a clean upsell for users who already trust the daily ritual.
