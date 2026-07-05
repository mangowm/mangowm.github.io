import { createRootRoute, HeadContent, Outlet, Link } from "@tanstack/react-router";
import { Header } from "../components/header";
import { siteConfig } from "../constants";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        title: siteConfig.title,
      },
      {
        name: "description",
        content: siteConfig.description,
      },
      {
        property: "og:title",
        content: siteConfig.title,
      },
      {
        property: "og:description",
        content: siteConfig.description,
      },
      {
        property: "og:type",
        content: "website",
      },
    ],
  }),
  component: () => (
    <>
      <HeadContent />
      <Header />
      <Outlet />
    </>
  ),
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-24 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-8">This page does not exist yet.</p>
      <Link to="/" className="btn-primary">
        Go Home
      </Link>
    </div>
  ),
});
