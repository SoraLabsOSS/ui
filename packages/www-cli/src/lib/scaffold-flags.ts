import { isInteractiveTerminal } from "./terminal.js";

export interface ScaffoldRunFlags {
  dryRun?: boolean;
  noInput?: boolean;
  quiet?: boolean;
  yes?: boolean;
}

export function allowsPrompts(flags: ScaffoldRunFlags): boolean {
  return isInteractiveTerminal() && !flags.noInput;
}

export function isScripted(flags: ScaffoldRunFlags): boolean {
  return Boolean(flags.yes || flags.noInput);
}

export function shouldUsePlainOutput(flags: ScaffoldRunFlags): boolean {
  return Boolean(flags.dryRun || flags.quiet || !allowsPrompts(flags));
}
