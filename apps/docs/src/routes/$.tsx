import { createFileRoute } from "@tanstack/react-router";
import { loader, DocsView } from "@/lib/docs-view";
import { docs } from "@/lib/source";

export const Route = createFileRoute("/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? [];
    const data = await loader({ data: slugs });
    await docs.getPage(data.path)?.preload();
    return data;
  },
});

function Page() {
  return <DocsView loaderData={Route.useLoaderData()} />;
}
