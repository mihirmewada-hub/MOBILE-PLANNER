// Native platforms: Skia is synchronously available
export async function loadSkia(): Promise<void> {
  return Promise.resolve();
}
