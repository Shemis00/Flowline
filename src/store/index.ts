import type { BoardStore } from "./types";
import { RtdbStore } from "./rtdb";
import { LocalStore } from "./local";

export type { BoardStore } from "./types";

export type BackendKind = "firebase" | "local";

/** Subset of Vite env keys used to enable the Firebase backend. */
export type FirebaseEnv = {
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_DATABASE_URL?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_APP_ID?: string;
};

/** Reads Vite env vars; returns null when Firebase is not configured. */
export function resolveFirebaseConfig(
  env: FirebaseEnv = import.meta.env,
): Record<string, string> | null {
  const projectId = env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = env.VITE_FIREBASE_API_KEY;
  if (!projectId || !apiKey) return null;
  return {
    apiKey,
    projectId,
    databaseURL:
      env.VITE_FIREBASE_DATABASE_URL ?? `https://${projectId}-default-rtdb.firebaseio.com`,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? `${projectId}.firebaseapp.com`,
    appId: env.VITE_FIREBASE_APP_ID ?? "",
  };
}

export function createStore(): { store: BoardStore; backend: BackendKind } {
  const config = resolveFirebaseConfig();
  if (config) {
    return { store: new RtdbStore(config), backend: "firebase" };
  }
  return { store: new LocalStore(), backend: "local" };
}
