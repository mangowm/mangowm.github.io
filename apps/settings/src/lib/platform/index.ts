import { createBrowserHost } from "./browser";
import { createTauriHost } from "./tauri";
import type { ConfigHost } from "./types";

let host: ConfigHost | undefined;

export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function configureHost(options: { defaultConfig: string }): ConfigHost {
  host = isTauri() ? createTauriHost(options.defaultConfig) : createBrowserHost();
  return host;
}

export function getHost(): ConfigHost {
  if (!host) throw new Error("Platform host is not configured");
  return host;
}

export type { ConfigHost, PendingFile, Preferences, RawConfigFile } from "./types";
