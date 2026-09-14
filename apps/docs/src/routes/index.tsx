import { createFileRoute } from "@tanstack/react-router";
import { loader, DocsView } from "@/lib/docs-view";
import { docs } from "@/lib/source";

export const Route = createFileRoute("/")({
  component: Page,
  loader: async () => {
    const data = await loader({ data: [] });
    await docs.getPage(data.path)?.preload();
    return data;
  },
});

function Page() {
  return <DocsView loaderData={Route.useLoaderData()} />;
}
