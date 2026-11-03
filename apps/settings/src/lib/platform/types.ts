export interface RawConfigFile {
  absPath: string;
  refPath: string;
  text: string;
}

export interface PendingFile {
  absPath: string;
  text: string;
}

export interface Preferences {
  version?: string;
  onboardingCompleted?: boolean;
  backup?: { createdAt: string; path: string };
  [key: string]: unknown;
}

export interface ConfigHost {
  readonly kind: "tauri" | "browser";
  hasConfig(): Promise<boolean>;
  load(): Promise<RawConfigFile[]>;
  save(files: PendingFile[]): Promise<void>;
  reload(): Promise<void>;
  download(files: RawConfigFile[]): void;
  backup?(): Promise<string>;
  openExternal(url: string): Promise<void>;
  preferences: {
    read(): Promise<Preferences>;
    write(update: Preferences): Promise<Preferences>;
  };
}
