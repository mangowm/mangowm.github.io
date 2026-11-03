import { TooltipProvider } from "@mangowm/ui/components/tooltip";
import { SettingsPage } from "@/components/settings-page";
import "./index.css";

export default function App() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <SettingsPage />
      </div>
    </TooltipProvider>
  );
}
