import type { ConfigDocument } from "../document";
import { switchStatesMigration } from "./switch-states";
import type { Migration, MigrationFinding, MigrationResult } from "./types";

export const MIGRATIONS: readonly Migration[] = [switchStatesMigration];

export function detectMigrations(document: ConfigDocument): MigrationFinding[] {
  return MIGRATIONS.flatMap((migration) => migration.detect(document));
}

export function applyMigrations(document: ConfigDocument): MigrationResult {
  const initial = detectMigrations(document);
  let next = document;

  for (const migration of MIGRATIONS) {
    if (!migration.detect(next).some((finding) => finding.fixable)) continue;
    next = migration.apply(next);
  }

  const remaining = detectMigrations(next);
  const remainingIds = new Set(remaining.map(findingKey));
  const applied = initial.filter(
    (finding) => finding.fixable && !remainingIds.has(findingKey(finding)),
  );

  return { document: applied.length > 0 ? next : document, applied, remaining };
}

function findingKey(finding: MigrationFinding): string {
  return `${finding.migrationId}:${finding.line}:${finding.before}:${finding.after}`;
}
