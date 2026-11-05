import { Link } from "wouter";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="mb-2 text-2xl">Page not found</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          The page you requested could not be found.
        </p>
        <Link href="/" className="text-primary underline-offset-4 hover:underline">
          Return to Snakemoji
        </Link>
      </Card>
    </main>
  );
}
