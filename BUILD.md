# Day Planner — EAS Build Guide

Your app is fully configured for EAS Build. Follow these steps from your own machine (or from the
Emergent terminal here) to produce a downloadable APK for Android or a simulator/device build for iOS.

## 1. Prerequisites (one-time)

1. Create a free Expo account at https://expo.dev (if you don't have one).
2. Log in locally (from the project root):
   ```bash
   cd /app/frontend
   npx eas-cli login
   ```
3. Link this project to your Expo account (creates the `projectId` and writes it back to app.json):
   ```bash
   npx eas-cli init
   ```

## 2. Build an Android APK (easiest — installable on any Android phone)

```bash
cd /app/frontend
npx eas-cli build --profile preview --platform android
```

- Takes ~10-15 min on EAS free tier.
- When it finishes you'll get a URL like `https://expo.dev/artifacts/...apk`
- Open that URL on your Android phone → download → install (enable "Install from unknown sources" if prompted).

## 3. Build for iOS (choose one)

**Option A — Simulator build** (no Apple Developer account required):
```bash
npx eas-cli build --profile preview --platform ios
```
Artifact is a `.tar.gz` you drop onto an iOS simulator.

**Option B — Real iPhone** (requires Apple Developer account, $99/yr):
```bash
npx eas-cli build --profile preview-device --platform ios
```
EAS will walk you through provisioning profile / ad-hoc device registration.

## 4. Production build (for App Store / Play Store)

```bash
npx eas-cli build --profile production --platform all
```

---

## What's pre-configured

| Field | Value |
|---|---|
| App name | Day Planner |
| Slug | `day-planner-red` |
| iOS bundle id | `com.emergent.dayplannerred` |
| Android package | `com.emergent.dayplannerred` |
| Version | 1.0.0 (remote-managed via EAS `appVersionSource`) |
| Scheme (deep-link) | `dayplanner://` |
| Permissions | `VIBRATE` (Android, for haptic feedback) |

You can change these freely in `/app/frontend/app.json` before running build.

## Data model

All user data (tasks, categories, theme choice) persists via **AsyncStorage** on the device.
There is no backend dependency for the mobile build — it runs fully offline with the seeded demo data
and any changes the user makes. Auth can be added later by wiring up the already-scaffolded store.

## Common issues

- **"Project ID not found"** → re-run `npx eas-cli init`.
- **"You must be logged in"** → run `npx eas-cli login`.
- **Build queue is slow** on free tier — paid priority queue is optional.
- **iOS credentials errors** — let EAS auto-manage your certs (`--auto-submit-with-profile` is off; EAS will prompt).

## Quick one-liner (after step 1 is done once)

```bash
cd /app/frontend && npx eas-cli build --profile preview --platform android --non-interactive
```
