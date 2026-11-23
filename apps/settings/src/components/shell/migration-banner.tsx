import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@mangowm/ui/components/button";
import { MANGO_VERSION } from "@mangowm.github.io/config/catalog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@mangowm/ui/components/alert-dialog";

import { useConfigStore, useMigrationFindings } from "@/lib/config/store";

export function MigrationBanner() {
  const findings = useMigrationFindings();
  const fixMigrations = useConfigStore((state) => state.fixMigrations);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [fixing, setFixing] = useState(false);

  if (findings.length === 0) return null;

  const fixable = findings.filter((finding) => finding.fixable);

  const fix = async () => {
    setFixing(true);
    try {
      await fixMigrations();
      setReviewOpen(false);
    } finally {
      setFixing(false);
    }
  };

  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b bg-muted/40 px-4 py-2.5 lg:px-6">
        <AlertCircle className="size-4 shrink-0 text-muted-foreground" />
        <p className="min-w-0 flex-1 text-sm text-muted-foreground">
          {findings.length} legacy switch binding{findings.length === 1 ? "" : "s"} found.
        </p>
        <Button variant="outline" size="sm" onClick={() => setReviewOpen(true)}>
          Review
        </Button>
        {fixable.length > 0 && (
          <Button size="sm" disabled={fixing} onClick={() => void fix()}>
            {fixing ? "Fixing..." : `Fix ${fixable.length}`}
          </Button>
        )}
      </div>

      <AlertDialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Legacy switch bindings</AlertDialogTitle>
            <AlertDialogDescription>
              {fixable.length > 0
                ? `These bindings use states removed in mango ${MANGO_VERSION}. Fixing them preserves the rest of the file.`
                : "These bindings conflict with existing switch states. Resolve them in the config file."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="max-h-64 space-y-2 overflow-y-auto text-left">
            {findings.map((finding, index) => (
              <div
                key={`${finding.absPath}:${finding.line}:${index}`}
                className="rounded-lg border border-border/60 px-3 py-2"
              >
                <div className="font-mono text-[11px] text-muted-foreground/70">
                  {finding.refPath}:{finding.line}
                </div>
                <div className="text-sm">{finding.message}</div>
              </div>
            ))}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {fixable.length > 0 && (
              <AlertDialogAction disabled={fixing} onClick={() => void fix()}>
                {fixing ? "Fixing..." : `Fix ${fixable.length}`}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
