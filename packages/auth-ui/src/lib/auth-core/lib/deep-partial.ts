/**
 * Recursive partial. Leaves functions and arrays intact so callable props
 * stay callable and array element types are preserved.
 */
// oxlint-disable-next-line @typescript-eslint/no-explicit-any -- canonical "any function" top type
export type DeepPartial<T> = T extends (...args: any[]) => any
  ? T
  : T extends readonly unknown[]
    ? T
    : T extends object
      ? { [P in keyof T]?: DeepPartial<T[P]> }
      : T;
