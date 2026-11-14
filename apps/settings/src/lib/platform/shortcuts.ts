function detectMac(): boolean {
  if (typeof navigator === "undefined") return false;
  const platform = navigator.platform ?? "";
  return /mac|iphone|ipad|ipod/i.test(platform);
}

export const IS_MAC = detectMac();

export const MOD_KEY = IS_MAC ? "⌘" : "Ctrl";
export const SEARCH_SHORTCUT = IS_MAC ? "⌘K" : "Ctrl+K";
export const UNDO_SHORTCUT = IS_MAC ? "⌘Z" : "Ctrl+Z";
export const REDO_SHORTCUT = IS_MAC ? "⇧⌘Z" : "Ctrl+Shift+Z";
