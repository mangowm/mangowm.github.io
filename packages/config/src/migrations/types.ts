import type { ConfigDocument } from "../document";

export interface MigrationFinding {
  migrationId: string;
  line: number;
  message: string;
  before: string;
  after: string;
  fixable: boolean;
}

export interface Migration {
  id: string;
  title: string;
  description: string;
  detect(document: ConfigDocument): MigrationFinding[];
  apply(document: ConfigDocument): ConfigDocument;
}

export interface MigrationResult {
  document: ConfigDocument;
  applied: MigrationFinding[];
  remaining: MigrationFinding[];
}
