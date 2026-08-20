import type { AuthPlugin } from "./auth-plugin";

/**
 * Creates a plugin factory and attaches its `id` as a static property so
 * consumers (e.g. `useAuthPlugin`) can look it up without invoking the
 * factory.
 *
 * @example
 * ```ts
 * export const themePlugin = createAuthPlugin(
 *   "theme",
 *   (options: ThemePluginOptions) => ({
 *     setTheme: options.setTheme,
 *     themes: options.themes ?? ["system", "light", "dark"]
 *   })
 * )
 * ```
 */
export function createAuthPlugin<
  const TId extends string,
  TArgs extends unknown[],
  TResult extends Omit<AuthPlugin, "id"> & object,
>(id: TId, factory: (...args: TArgs) => TResult) {
  const wrapped = (...args: TArgs) => ({
    ...factory(...args),
    id,
  });

  return Object.assign(wrapped, { id });
}
