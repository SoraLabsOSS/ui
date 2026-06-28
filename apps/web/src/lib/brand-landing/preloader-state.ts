/** True until the first preloader finishes (or is skipped). */
export let isInitialLoad = true;

export function completeInitialLoad() {
  isInitialLoad = false;
}
