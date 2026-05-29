import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useConfigStore } from "@/lib/config-store";
import { useShallow } from "zustand/react/shallow";

export function PageHeader({ title }: { title?: string }) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" />
        <h1 className="text-base font-medium">{title ?? "Settings"}</h1>
        <div className="ml-auto">
          <ApplyButton />
        </div>
      </div>
    </header>
  );
}

function ApplyButton() {
  const { applying, loading, dirty, apply } = useConfigStore(
    useShallow((s) => ({
      applying: s.applying,
      loading: s.loading,
      dirty: s.dirty,
      apply: s.apply,
    })),
  );

  if (loading) return null;

  return (
    <Button onClick={apply} disabled={applying || !dirty}>
      {applying ? "Applying..." : dirty ? "Apply" : "Applied"}
    </Button>
  );
}
