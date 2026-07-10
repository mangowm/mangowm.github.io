import { createFileRoute } from "@tanstack/react-router";
import { loader, clientLoader, DocsView } from "@/lib/docs-view";

export const Route = createFileRoute("/$")({
  component: Page,
  loader: async ({ params }) => {
    const slugs = params._splat?.split("/") ?? [];
    const data = await loader({ data: slugs });
    await clientLoader.preload(data.path);
    return data;
  },
});

function Page() {
  return <DocsView loaderData={Route.useLoaderData()} />;
}
