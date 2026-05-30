import type { DocSection } from "@/lib/doc-types";

export const autostartDocs: DocSection[] = [
  {
    heading: "exec-once",
    text: "Each command runs once on startup in the order listed. Use absolute paths to persistent programs like status bars, wallpapers, and notification daemons.",
  },
  {
    heading: "Tips",
    text: "Use absolute paths to avoid resolution issues. To run multiple arguments, write the full command as it would appear in your config file.",
  },
  {
    heading: "Examples",
    code: "waybar\nswaybg -i ~/.config/mango/wallpaper/room.png",
  },
];
