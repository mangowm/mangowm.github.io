export type DirectiveKey = "exec" | "exec_once" | "source" | "source_optional";

export interface DirectiveDef {
  key: DirectiveKey;
  label: string;
  description: string;
}

export const DIRECTIVES: readonly DirectiveDef[] = [
  {
    key: "exec",
    label: "Run on load and reload",
    description: "Commands run at startup and on each reload.",
  },
  {
    key: "exec_once",
    label: "Run Once",
    description: "Commands run once at startup.",
  },
  {
    key: "source",
    label: "Includes",
    description: "Loads other config files.",
  },
  {
    key: "source_optional",
    label: "Optional Includes",
    description: "Loads other config files when they exist.",
  },
];
