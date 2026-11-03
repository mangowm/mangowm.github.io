import { describe, expect, it } from "vite-plus/test";

import { formatConf, parseConf, stripComment, stripQuotes } from "./conf";

describe("conf document", () => {
  it("classifies comments, blanks, entries, and unknown lines", () => {
    const text = ["# comment", "", "blur = true", "not an entry", "exec = foot"].join("\n");

    const document = parseConf(text);

    expect(document.nodes.map((node) => node.kind)).toEqual([
      "comment",
      "blank",
      "entry",
      "raw",
      "entry",
    ]);
  });

  it("keeps repeated keys in order", () => {
    const document = parseConf("exec = a\nexec = b\n");

    const values = document.nodes.filter((node) => node.kind === "entry").map((node) => node.value);

    expect(values).toEqual(["a", "b"]);
  });

  it("records one-based source lines", () => {
    const document = parseConf("a = 1\nb = 2", "extra.conf");

    const entry = document.nodes[1];

    expect(entry?.at).toEqual({ file: "extra.conf", line: 2 });
  });

  it("strips quotes and inline comments from the value", () => {
    const document = parseConf('exec = "foot --hold" # run\n');

    const entry = document.nodes[0];

    expect(entry?.kind).toBe("entry");
    if (entry?.kind === "entry") {
      expect(entry.value).toBe("foot --hold");
      expect(entry.path).toEqual(["exec"]);
      expect(entry.raw).toBe('exec = "foot --hold" # run');
    }
  });

  it("round-trips text exactly, including trailing newlines", () => {
    const text = "# comment\n\nblur = true\nexec = foot\n";

    expect(formatConf(parseConf(text))).toBe(text);
  });

  it("round-trips CRLF text", () => {
    const text = "a = 1\r\nb = 2\r\n";

    const document = parseConf(text);

    expect(document.newline).toBe("\r\n");
    expect(formatConf(document)).toBe(text);
  });
});

describe("conf value helpers", () => {
  it("keeps a hash inside quotes", () => {
    expect(stripComment('"a # b"')).toBe('"a # b"');
  });

  it("drops a hash after whitespace", () => {
    expect(stripComment("true # note")).toBe("true ");
  });

  it("keeps a hash without leading whitespace", () => {
    expect(stripComment("0x112233ff#x")).toBe("0x112233ff#x");
  });

  it("removes matching quotes only", () => {
    expect(stripQuotes('"foot"')).toBe("foot");
    expect(stripQuotes("'foot'")).toBe("foot");
    expect(stripQuotes('"foot')).toBe('"foot');
  });
});
