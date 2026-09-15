import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-24 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-8">This page does not exist yet.</p>
      <Link to="/" className="btn-primary">
        Go Home
      </Link>
    </div>
  );
}
