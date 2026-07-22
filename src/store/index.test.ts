import { describe, expect, it } from "vitest";
import { resolveFirebaseConfig } from "./index";

describe("resolveFirebaseConfig", () => {
  it("returns null when required env vars are missing", () => {
    expect(resolveFirebaseConfig({} as ImportMetaEnv)).toBeNull();
    expect(
      resolveFirebaseConfig({ VITE_FIREBASE_API_KEY: "key" } as ImportMetaEnv),
    ).toBeNull();
    expect(
      resolveFirebaseConfig({ VITE_FIREBASE_PROJECT_ID: "proj" } as ImportMetaEnv),
    ).toBeNull();
  });

  it("builds a config with defaults derived from the project id", () => {
    const config = resolveFirebaseConfig({
      VITE_FIREBASE_API_KEY: "key",
      VITE_FIREBASE_PROJECT_ID: "flowline",
    } as ImportMetaEnv);

    expect(config).toEqual({
      apiKey: "key",
      projectId: "flowline",
      databaseURL: "https://flowline-default-rtdb.firebaseio.com",
      authDomain: "flowline.firebaseapp.com",
      appId: "",
    });
  });

  it("prefers explicit database URL, auth domain, and app id", () => {
    const config = resolveFirebaseConfig({
      VITE_FIREBASE_API_KEY: "key",
      VITE_FIREBASE_PROJECT_ID: "flowline",
      VITE_FIREBASE_DATABASE_URL: "https://flowline-default-rtdb.europe-west1.firebasedatabase.app",
      VITE_FIREBASE_AUTH_DOMAIN: "flowline.firebaseapp.com",
      VITE_FIREBASE_APP_ID: "1:123:web:abc",
    } as ImportMetaEnv);

    expect(config?.databaseURL).toContain("europe-west1");
    expect(config?.appId).toBe("1:123:web:abc");
  });
});
