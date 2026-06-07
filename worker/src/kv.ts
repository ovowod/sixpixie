import type { UserConfig } from "./types";

export async function getUserConfig(kv: KVNamespace, userId: string): Promise<UserConfig | null> {
  const raw = await kv.get(userId);
  if (!raw) return null;
  return JSON.parse(raw) as UserConfig;
}

export async function setUserConfig(kv: KVNamespace, userId: string, config: UserConfig): Promise<void> {
  await kv.put(userId, JSON.stringify(config));
}
