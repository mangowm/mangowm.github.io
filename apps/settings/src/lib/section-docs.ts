export interface DocSection {
  heading: string;
  text?: string;
  code?: string;
}

const docs: Record<string, DocSection[]> = {
  Autostart: [
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
  ],
};

export function getDocContent(section: string): DocSection[] | null {
  return docs[section] ?? null;
}
