// @ts-nocheck
import { frontmatter as __fd_glob_24 } from "../content/docs/window-management/scratchpad.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_23 } from "../content/docs/window-management/rules.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_22 } from "../content/docs/window-management/overview.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_21 } from "../content/docs/window-management/layouts.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_20 } from "../content/docs/visuals/theming.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_19 } from "../content/docs/visuals/status-bar.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_18 } from "../content/docs/visuals/effects.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_17 } from "../content/docs/visuals/animations.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_16 } from "../content/docs/configuration/monitors.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_15 } from "../content/docs/configuration/miscellaneous.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_14 } from "../content/docs/configuration/input.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_13 } from "../content/docs/configuration/environment.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_12 } from "../content/docs/configuration/basics.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_11 } from "../content/docs/bindings/mouse-gestures.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_10 } from "../content/docs/bindings/keys.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_9 } from "../content/docs/quick-start.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_8 } from "../content/docs/ipc.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_7 } from "../content/docs/installation.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_6 } from "../content/docs/index.mdx?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_5 } from "../content/docs/faq.mdx?collection=docs&only=frontmatter"
import { default as __fd_glob_4 } from "../content/docs/visuals/meta.json?collection=docs"
import { default as __fd_glob_3 } from "../content/docs/window-management/meta.json?collection=docs"
import { default as __fd_glob_2 } from "../content/docs/configuration/meta.json?collection=docs"
import { default as __fd_glob_1 } from "../content/docs/bindings/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
    docs: {
      /**
       * extracted references (e.g. hrefs, paths), useful for analyzing relationships between pages.
       */
      extractedReferences: import("fumadocs-mdx").ExtractedReference[];
    },
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docsLazy("docs", "content/docs", {"meta.json": __fd_glob_0, "bindings/meta.json": __fd_glob_1, "configuration/meta.json": __fd_glob_2, "window-management/meta.json": __fd_glob_3, "visuals/meta.json": __fd_glob_4, }, {"faq.mdx": __fd_glob_5, "index.mdx": __fd_glob_6, "installation.mdx": __fd_glob_7, "ipc.mdx": __fd_glob_8, "quick-start.mdx": __fd_glob_9, "bindings/keys.mdx": __fd_glob_10, "bindings/mouse-gestures.mdx": __fd_glob_11, "configuration/basics.mdx": __fd_glob_12, "configuration/environment.mdx": __fd_glob_13, "configuration/input.mdx": __fd_glob_14, "configuration/miscellaneous.mdx": __fd_glob_15, "configuration/monitors.mdx": __fd_glob_16, "visuals/animations.mdx": __fd_glob_17, "visuals/effects.mdx": __fd_glob_18, "visuals/status-bar.mdx": __fd_glob_19, "visuals/theming.mdx": __fd_glob_20, "window-management/layouts.mdx": __fd_glob_21, "window-management/overview.mdx": __fd_glob_22, "window-management/rules.mdx": __fd_glob_23, "window-management/scratchpad.mdx": __fd_glob_24, }, {"faq.mdx": () => import("../content/docs/faq.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "installation.mdx": () => import("../content/docs/installation.mdx?collection=docs"), "ipc.mdx": () => import("../content/docs/ipc.mdx?collection=docs"), "quick-start.mdx": () => import("../content/docs/quick-start.mdx?collection=docs"), "bindings/keys.mdx": () => import("../content/docs/bindings/keys.mdx?collection=docs"), "bindings/mouse-gestures.mdx": () => import("../content/docs/bindings/mouse-gestures.mdx?collection=docs"), "configuration/basics.mdx": () => import("../content/docs/configuration/basics.mdx?collection=docs"), "configuration/environment.mdx": () => import("../content/docs/configuration/environment.mdx?collection=docs"), "configuration/input.mdx": () => import("../content/docs/configuration/input.mdx?collection=docs"), "configuration/miscellaneous.mdx": () => import("../content/docs/configuration/miscellaneous.mdx?collection=docs"), "configuration/monitors.mdx": () => import("../content/docs/configuration/monitors.mdx?collection=docs"), "visuals/animations.mdx": () => import("../content/docs/visuals/animations.mdx?collection=docs"), "visuals/effects.mdx": () => import("../content/docs/visuals/effects.mdx?collection=docs"), "visuals/status-bar.mdx": () => import("../content/docs/visuals/status-bar.mdx?collection=docs"), "visuals/theming.mdx": () => import("../content/docs/visuals/theming.mdx?collection=docs"), "window-management/layouts.mdx": () => import("../content/docs/window-management/layouts.mdx?collection=docs"), "window-management/overview.mdx": () => import("../content/docs/window-management/overview.mdx?collection=docs"), "window-management/rules.mdx": () => import("../content/docs/window-management/rules.mdx?collection=docs"), "window-management/scratchpad.mdx": () => import("../content/docs/window-management/scratchpad.mdx?collection=docs"), });