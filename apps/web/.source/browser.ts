// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
    docs: {
      /**
       * extracted references (e.g. hrefs, paths), useful for analyzing relationships between pages.
       */
      extractedReferences: import("fumadocs-mdx").ExtractedReference[];
    },
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"faq.mdx": () => import("../content/docs/faq.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "installation.mdx": () => import("../content/docs/installation.mdx?collection=docs"), "ipc.mdx": () => import("../content/docs/ipc.mdx?collection=docs"), "quick-start.mdx": () => import("../content/docs/quick-start.mdx?collection=docs"), "bindings/keys.mdx": () => import("../content/docs/bindings/keys.mdx?collection=docs"), "bindings/mouse-gestures.mdx": () => import("../content/docs/bindings/mouse-gestures.mdx?collection=docs"), "configuration/basics.mdx": () => import("../content/docs/configuration/basics.mdx?collection=docs"), "configuration/environment.mdx": () => import("../content/docs/configuration/environment.mdx?collection=docs"), "configuration/input.mdx": () => import("../content/docs/configuration/input.mdx?collection=docs"), "configuration/miscellaneous.mdx": () => import("../content/docs/configuration/miscellaneous.mdx?collection=docs"), "configuration/monitors.mdx": () => import("../content/docs/configuration/monitors.mdx?collection=docs"), "visuals/animations.mdx": () => import("../content/docs/visuals/animations.mdx?collection=docs"), "visuals/effects.mdx": () => import("../content/docs/visuals/effects.mdx?collection=docs"), "visuals/status-bar.mdx": () => import("../content/docs/visuals/status-bar.mdx?collection=docs"), "visuals/theming.mdx": () => import("../content/docs/visuals/theming.mdx?collection=docs"), "window-management/layouts.mdx": () => import("../content/docs/window-management/layouts.mdx?collection=docs"), "window-management/overview.mdx": () => import("../content/docs/window-management/overview.mdx?collection=docs"), "window-management/rules.mdx": () => import("../content/docs/window-management/rules.mdx?collection=docs"), "window-management/scratchpad.mdx": () => import("../content/docs/window-management/scratchpad.mdx?collection=docs"), }),
};
export default browserCollections;