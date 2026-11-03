import type { ConfigDocument, DocumentNode } from "./document";
import type { SourceLocation } from "./types";

/** Remove a `#` comment, respecting quotes. */
export function stripTomlComment(text: string): string {
  let quote = "";
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quote) {
      if (quote === '"' && char === "\\") {
        index++;
      } else if (char === quote) {
        quote = "";
      }
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "#") {
      return text.slice(0, index);
    }
  }
  return text;
}

/** Whether the collected lines form a complete statement. */
function isComplete(statement: string): boolean {
  const text = statement.trim();
  if (text === "") return true;
  if (text.startsWith("[")) return text.endsWith("]");

  const equals = text.indexOf("=");
  if (equals === -1) return true;

  let depth = 0;
  let quote = "";
  for (let index = equals + 1; index < text.length; index++) {
    const char = text[index];
    if (quote) {
      if (quote === '"' && char === "\\") {
        index++;
      } else if (char === quote) {
        quote = "";
      }
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "[") {
      depth++;
    } else if (char === "]") {
      depth--;
    }
  }

  return depth <= 0 && quote === "";
}

/** Remove matching quotes and decode double-quoted escapes. */
function unquote(text: string): string {
  const value = text.trim();
  const first = value[0];
  if (value.length < 2 || (first !== '"' && first !== "'") || !value.endsWith(first)) {
    return value;
  }

  const body = value.slice(1, -1);
  if (first === "'") return body;

  return body.replace(/\\(.)/g, (_match, escaped: string) => {
    switch (escaped) {
      case "n":
        return "\n";
      case "t":
        return "\t";
      case "r":
        return "\r";
      default:
        return escaped;
    }
  });
}

/** Convert one TOML scalar to the text form the normalizer expects. */
function scalar(text: string): string {
  const value = text.trim();
  if (value === "") return "";
  if (value === "true") return "1";
  if (value === "false") return "0";
  return unquote(value);
}

/** Split a TOML array into its scalar elements. */
export function arrayElements(text: string): string[] {
  const value = text.trim();
  if (!value.startsWith("[") || !value.endsWith("]")) return [scalar(value)];

  const body = value.slice(1, -1);
  const elements: string[] = [];
  let current = "";
  let quote = "";

  for (let index = 0; index < body.length; index++) {
    const char = body[index];
    if (quote) {
      current += char;
      if (quote === '"' && char === "\\") {
        current += body[++index] ?? "";
      } else if (char === quote) {
        quote = "";
      }
    } else if (char === '"' || char === "'") {
      quote = char;
      current += char;
    } else if (char === ",") {
      elements.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  elements.push(current);

  return elements.map(scalar).filter((element) => element !== "");
}

/** Keys whose TOML array is joined back into a comma list. */
function joinsArray(key: string): boolean {
  return (
    key.startsWith("animation_curve_") ||
    key === "scroller_proportion_preset" ||
    key === "circle_layout"
  );
}

/** Parse mango's line-oriented TOML subset into a lossless document. */
export function parseToml(text: string, file = ""): ConfigDocument {
  const newline: "\n" | "\r\n" = text.includes("\r\n") ? "\r\n" : "\n";
  const nodes: DocumentNode[] = [];
  let section: string[] = [];
  let buffer: string[] = [];
  let start = 0;

  const flush = () => {
    if (buffer.length === 0) return;

    const raw = buffer.join(newline);
    const at: SourceLocation = { file, line: start + 1 };
    const statement = buffer.map(stripTomlComment).join("\n").trim();
    buffer = [];

    if (statement.startsWith("[")) {
      const array = statement.startsWith("[[");
      const name = statement.replace(/^\[+/, "").replace(/\]+$/, "").trim();
      const path = name
        .split(".")
        .map((part) => part.trim())
        .filter((part) => part !== "");
      section = path;
      nodes.push({ kind: "section", path, array, raw, at });
      return;
    }

    const equals = statement.indexOf("=");
    if (equals === -1) {
      nodes.push({ kind: "raw", raw, at });
      return;
    }

    const key = unquote(statement.slice(0, equals).trim());
    const value = statement.slice(equals + 1).trim();
    const path = [...section, key];

    if (value.startsWith("[")) {
      const elements = arrayElements(value);
      if (joinsArray(key)) {
        nodes.push({ kind: "entry", path, value: elements.join(","), raw, at });
      } else {
        for (const element of elements) {
          nodes.push({ kind: "entry", path, value: element, raw, at });
        }
      }
      return;
    }

    nodes.push({ kind: "entry", path, value: scalar(value), raw, at });
  };

  text.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim();

    if (buffer.length === 0) {
      if (trimmed === "") {
        nodes.push({ kind: "blank", raw: line, at: { file, line: index + 1 } });
        return;
      }
      if (trimmed.startsWith("#")) {
        nodes.push({ kind: "comment", raw: line, at: { file, line: index + 1 } });
        return;
      }
      start = index;
    }

    buffer.push(line);
    if (isComplete(buffer.map(stripTomlComment).join("\n"))) flush();
  });

  flush();

  return { format: "toml", newline, nodes };
}

/** Write a TOML document back to text, preserving untouched statements. */
export function formatToml(document: ConfigDocument): string {
  return document.nodes.map((node) => node.raw).join(document.newline);
}
