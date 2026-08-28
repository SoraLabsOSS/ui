export function isInteractiveTerminal(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

export function nonInteractiveHint(command: string): string {
  return [
    "Interactive prompts require a real terminal (stdin/stdout TTY).",
    "",
    "If you are in CI or a nested runner, pass flags instead:",
    `  ${command}`,
  ].join("\n");
}
