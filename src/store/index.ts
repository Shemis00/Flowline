import type { BoardStore } from "./types";
import { RtdbStore } from "./rtdb";
import { LocalStore } from "./local";

export type { BoardStore } from "./types";

export type BackendKind = "firebase" | "local";

function firebaseConfig(): Record<string, string> | null {
  const env = import.meta.env;
  const projectId = env.VITE_FIREBASE_PROJECT_ID as string | undefined;
  const apiKey = env.VITE_FIREBASE_API_KEY as string | undefined;
  if (!projectId || !apiKey) return null;
  return {
    apiKey,
    projectId,
    databaseURL:
      (env.VITE_FIREBASE_DATABASE_URL as string) ??
      `https://${projectId}-default-rtdb.firebaseio.com`,
    authDomain: (env.VITE_FIREBASE_AUTH_DOMAIN as string) ?? `${projectId}.firebaseapp.com`,
    appId: (env.VITE_FIREBASE_APP_ID as string) ?? "",
  };
}

export function createStore(): { store: BoardStore; backend: BackendKind } {
  const config = firebaseConfig();
  if (config) {
    return { store: new RtdbStore(config), backend: "firebase" };
  }
  return { store: new LocalStore(), backend: "local" };
}
