import { describe, expect, it } from "vite-plus/test";

import { formatAction, parseAction } from "./dispatch";
import { ValueError } from "./value";

describe("actions", () => {
  it("splits the dispatcher from its arguments", () => {
    expect(parseAction("spawn,foot")).toEqual({ dispatcher: "spawn", args: "foot" });
  });

  it("keeps a dispatcher without arguments", () => {
    expect(parseAction("killclient")).toEqual({ dispatcher: "killclient" });
  });

  it("keeps commas inside the arguments", () => {
    expect(parseAction("resizewin,+10,0")).toEqual({ dispatcher: "resizewin", args: "+10,0" });
  });

  it("keeps variable references unresolved", () => {
    expect(parseAction("$term")).toEqual({ variable: "term" });
    expect(parseAction("${term},--hold")).toEqual({ variable: "term", args: "--hold" });
  });

  it("rejects unknown dispatchers", () => {
    expect(() => parseAction("nope")).toThrow(ValueError);
  });

  it("round-trips", () => {
    expect(formatAction(parseAction("spawn,foot"))).toBe("spawn,foot");
    expect(formatAction(parseAction("$term"))).toBe("$term");
  });
});
