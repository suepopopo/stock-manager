export type ConfigEntry = {
  key: string;
  label: string;
};

export function resolveLabel(entries: ConfigEntry[], key: string): string {
  const entry = entries.find((e) => e.key === key);
  if (!entry) {
    throw new Error(`unknown config key: ${key}`);
  }
  return entry.label;
}
