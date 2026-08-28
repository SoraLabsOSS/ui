export function shouldRunRegistryBuildTests(): boolean {
  return process.env.WWW_CLI_RUN_REGISTRY_BUILD === "1";
}
