import { describe, expect, it } from "vite-plus/test";

import { readConfigTree, uploadConfigFromDir } from "./upload";

function contents(entries: Record<string, string>): Map<string, Promise<string>> {
  return new Map(Object.entries(entries).map(([path, text]) => [path, Promise.resolve(text)]));
}

function file(path: string, text: string): File {
  const entry = new File([text], path.split("/").pop()!);
  Object.defineProperty(entry, "webkitRelativePath", { value: path });
  return entry;
}

describe("readConfigTree", () => {
  it("returns nothing when no files were selected", async () => {
    await expect(readConfigTree(new Map())).resolves.toEqual([]);
  });

  it("prefers the mango config over unrelated configs", async () => {
    const files = await readConfigTree(
      contents({
        "mango/config.conf": "blur=1\n",
        "other/config.conf": "blur=0\n",
      }),
    );

    expect(files.map((file) => file.absPath)).toEqual(["mango/config.conf"]);
  });

  it("prefers config.conf as the entry file", async () => {
    const files = await readConfigTree(
      contents({
        "config.toml": "[global]\nblur = 1\n",
        "config.conf": "blur=1\n",
        "extra.conf": "blur=0\n",
      }),
    );

    expect(files.map((file) => file.absPath)).toEqual(["config.conf"]);
  });

  it("uses config.toml when there is no config.conf", async () => {
    const files = await readConfigTree(
      contents({
        "config.toml": "[global]\nblur = 1\n",
        "extra.conf": "blur=0\n",
      }),
    );

    expect(files.map((file) => file.absPath)).toEqual(["config.toml"]);
  });

  it("follows relative sources and keeps the source as the ref path", async () => {
    const files = await readConfigTree(
      contents({
        "mango/config.conf": "blur=1\nsource=layout.conf\n",
        "mango/layout.conf": "gaps=5\n",
      }),
    );

    expect(files).toEqual([
      {
        absPath: "mango/config.conf",
        refPath: "config.conf",
        text: "blur=1\nsource=layout.conf\n",
      },
      { absPath: "mango/layout.conf", refPath: "layout.conf", text: "gaps=5\n" },
    ]);
  });

  it("resolves absolute and home-relative sources by suffix", async () => {
    const files = await readConfigTree(
      contents({
        "config.conf":
          "source=~/.config/mango/layout.conf\nsource=/home/user/.config/mango/rules.conf\n",
        "layout.conf": "gaps=5\n",
        "rules.conf": "windowrule=foo\n",
      }),
    );

    expect(files.map((file) => file.refPath)).toEqual([
      "config.conf",
      "~/.config/mango/layout.conf",
      "/home/user/.config/mango/rules.conf",
    ]);
  });

  it("ignores config files that are not referenced", async () => {
    const files = await readConfigTree(
      contents({
        "config.conf": "blur=1\n",
        "unused.conf": "blur=0\n",
      }),
    );

    expect(files.map((file) => file.absPath)).toEqual(["config.conf"]);
  });

  it("does not include the same file twice", async () => {
    const files = await readConfigTree(
      contents({
        "config.conf": "source=layout.conf\nsource=./layout.conf\n",
        "layout.conf": "gaps=5\n",
      }),
    );

    expect(files.map((file) => file.absPath)).toEqual(["config.conf", "layout.conf"]);
  });
});

describe("uploadConfigFromDir", () => {
  it("strips the selected folder and ignores unrelated files", async () => {
    const files = await uploadConfigFromDir([
      file("mango/config.conf", "blur=1\nsource=layout.conf\n"),
      file("mango/layout.conf", "gaps=5\n"),
      file("mango/notes.txt", "ignored\n"),
    ]);

    expect(files.map((entry) => entry.absPath)).toEqual(["config.conf", "layout.conf"]);
  });
});
