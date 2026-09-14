const CURSOR_TRAIL_MEDIA =
  "https://cdn.soralabs.studio/media/demo/cursor-trail-reveal" as const;

export const DEMO_TRAIL_IMAGE_COUNT = 19;

export const DEMO_TRAIL_IMAGES = Array.from(
  { length: DEMO_TRAIL_IMAGE_COUNT },
  (_, index) => `${CURSOR_TRAIL_MEDIA}/trail-${index + 1}.jpg`
);
