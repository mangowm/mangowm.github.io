export const siteConfig = {
  name: "mangowm",
  title: "mangowm - Lightweight Wayland Compositor",
  description: "A lightweight and feature-rich Wayland compositor",
  url: "https://mangowm.github.io",
  ogImage: "/og/home/image.webp",
};

export function createTitle(page: string): string {
  return page ? `${page} | ${siteConfig.name}` : siteConfig.name;
}
