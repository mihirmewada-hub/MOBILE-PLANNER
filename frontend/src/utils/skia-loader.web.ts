// Web platform: skip Skia loading; our components render SVG/View fallbacks instead.
export async function loadSkia(): Promise<void> {
  return Promise.resolve();
}
