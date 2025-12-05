// @ts-nocheck
import * as __fd_glob_24 from "../content/docs/window-management/scratchpad.mdx?collection=docs"
import * as __fd_glob_23 from "../content/docs/window-management/rules.mdx?collection=docs"
import * as __fd_glob_22 from "../content/docs/window-management/overview.mdx?collection=docs"
import * as __fd_glob_21 from "../content/docs/window-management/layouts.mdx?collection=docs"
import * as __fd_glob_20 from "../content/docs/configuration/monitors.mdx?collection=docs"
import * as __fd_glob_19 from "../content/docs/configuration/input.mdx?collection=docs"
import * as __fd_glob_18 from "../content/docs/configuration/basics.mdx?collection=docs"
import * as __fd_glob_17 from "../content/docs/bindings/mouse-gestures.mdx?collection=docs"
import * as __fd_glob_16 from "../content/docs/bindings/keys.mdx?collection=docs"
import * as __fd_glob_15 from "../content/docs/appearance/theming.mdx?collection=docs"
import * as __fd_glob_14 from "../content/docs/appearance/effects.mdx?collection=docs"
import * as __fd_glob_13 from "../content/docs/appearance/animations.mdx?collection=docs"
import * as __fd_glob_12 from "../content/docs/advanced/waybar.mdx?collection=docs"
import * as __fd_glob_11 from "../content/docs/advanced/ipc.mdx?collection=docs"
import * as __fd_glob_10 from "../content/docs/advanced/integrations.mdx?collection=docs"
import * as __fd_glob_9 from "../content/docs/quick-start.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/installation.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/index.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/faq.mdx?collection=docs"
import { default as __fd_glob_5 } from "../content/docs/window-management/meta.json?collection=docs"
import { default as __fd_glob_4 } from "../content/docs/configuration/meta.json?collection=docs"
import { default as __fd_glob_3 } from "../content/docs/bindings/meta.json?collection=docs"
import { default as __fd_glob_2 } from "../content/docs/appearance/meta.json?collection=docs"
import { default as __fd_glob_1 } from "../content/docs/advanced/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, "advanced/meta.json": __fd_glob_1, "appearance/meta.json": __fd_glob_2, "bindings/meta.json": __fd_glob_3, "configuration/meta.json": __fd_glob_4, "window-management/meta.json": __fd_glob_5, }, {"faq.mdx": __fd_glob_6, "index.mdx": __fd_glob_7, "installation.mdx": __fd_glob_8, "quick-start.mdx": __fd_glob_9, "advanced/integrations.mdx": __fd_glob_10, "advanced/ipc.mdx": __fd_glob_11, "advanced/waybar.mdx": __fd_glob_12, "appearance/animations.mdx": __fd_glob_13, "appearance/effects.mdx": __fd_glob_14, "appearance/theming.mdx": __fd_glob_15, "bindings/keys.mdx": __fd_glob_16, "bindings/mouse-gestures.mdx": __fd_glob_17, "configuration/basics.mdx": __fd_glob_18, "configuration/input.mdx": __fd_glob_19, "configuration/monitors.mdx": __fd_glob_20, "window-management/layouts.mdx": __fd_glob_21, "window-management/overview.mdx": __fd_glob_22, "window-management/rules.mdx": __fd_glob_23, "window-management/scratchpad.mdx": __fd_glob_24, });