// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"faq.mdx": () => import("../content/docs/faq.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "installation.mdx": () => import("../content/docs/installation.mdx?collection=docs"), "quick-start.mdx": () => import("../content/docs/quick-start.mdx?collection=docs"), "advanced/integrations.mdx": () => import("../content/docs/advanced/integrations.mdx?collection=docs"), "advanced/ipc.mdx": () => import("../content/docs/advanced/ipc.mdx?collection=docs"), "advanced/waybar.mdx": () => import("../content/docs/advanced/waybar.mdx?collection=docs"), "appearance/animations.mdx": () => import("../content/docs/appearance/animations.mdx?collection=docs"), "appearance/effects.mdx": () => import("../content/docs/appearance/effects.mdx?collection=docs"), "appearance/theming.mdx": () => import("../content/docs/appearance/theming.mdx?collection=docs"), "bindings/keys.mdx": () => import("../content/docs/bindings/keys.mdx?collection=docs"), "bindings/mouse-gestures.mdx": () => import("../content/docs/bindings/mouse-gestures.mdx?collection=docs"), "configuration/basics.mdx": () => import("../content/docs/configuration/basics.mdx?collection=docs"), "configuration/input.mdx": () => import("../content/docs/configuration/input.mdx?collection=docs"), "configuration/monitors.mdx": () => import("../content/docs/configuration/monitors.mdx?collection=docs"), "window-management/layouts.mdx": () => import("../content/docs/window-management/layouts.mdx?collection=docs"), "window-management/overview.mdx": () => import("../content/docs/window-management/overview.mdx?collection=docs"), "window-management/rules.mdx": () => import("../content/docs/window-management/rules.mdx?collection=docs"), "window-management/scratchpad.mdx": () => import("../content/docs/window-management/scratchpad.mdx?collection=docs"), }),
};
export default browserCollections;