// worker/src/types.ts
export interface UserConfig {
  departure_station: string;   // e.g. "성균관대"
  line: string;                // e.g. "1"
  direction: string;           // "상행" | "하행" | "내선" | "외선"
  destination_station: string; // e.g. "수원" — display only, not used for filtering
}

export interface Env {
  USER_CONFIG: KVNamespace;
  DISCORD_BOT_TOKEN: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_APPLICATION_ID: string;
  SUBWAY_API_KEY: string;
  GITHUB_TOKEN: string;
  GITHUB_REPO: string;
  GITHUB_WORKFLOW_FILE: string;
  GITHUB_REF: string;
}
