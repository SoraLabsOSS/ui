export const DEMO_TRAIL_IMAGE_COUNT = 19;

export const DEMO_TRAIL_IMAGES = Array.from(
  { length: DEMO_TRAIL_IMAGE_COUNT },
  (_, index) => `/demo/trail-images/trail-${index + 1}.jpg`
);
