import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@mangowm/ui/components/button";

export function RouteError({ reset }: ErrorComponentProps) {
  return (
    <div
      role="alert"
      className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center"
    >
      <h1 className="mb-3 text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mb-8 text-muted-foreground">Try again or go back home.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button className="h-11 rounded-full px-6 text-[0.9375rem] font-semibold" onClick={reset}>
          Try again
        </Button>
        <Button
          variant="outline"
          className="h-11 rounded-full px-6 text-[0.9375rem] font-semibold"
          render={<Link to="/" />}
        >
          Go home
        </Button>
      </div>
    </div>
  );
}
