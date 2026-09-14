import { useState, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsPage } from "@/components/settings-page";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { isOnboardingCompleted } from "@/lib/onboarding";
import "./index.css";

export default function App() {
  const [view, setView] = useState<"loading" | "onboarding" | "settings">("loading");

  useEffect(() => {
    (async () => {
      setView((await isOnboardingCompleted()) ? "settings" : "onboarding");
    })();
  }, []);

  if (view === "loading") return null;

  if (view === "onboarding") {
    return <OnboardingFlow onComplete={() => setView("settings")} />;
  }

  return (
    <TooltipProvider>
      <div className="bg-background text-foreground min-h-screen selection:bg-primary selection:text-primary-foreground">
        <SettingsPage />
      </div>
    </TooltipProvider>
  );
}
