import { Link } from "@tanstack/react-router";
import { Button } from "@mangowm/ui/components/button";

export function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="mb-3 text-4xl font-semibold tracking-tight">404</h1>
      <p className="mb-8 text-muted-foreground">This page does not exist yet.</p>
      <Button
        size="lg"
        className="h-11 rounded-full px-6 text-[0.9375rem] font-semibold"
        render={<Link to="/" />}
      >
        Go home
      </Button>
    </div>
  );
}
