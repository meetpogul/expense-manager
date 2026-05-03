import { ArrowRightIcon } from "lucide-react";

import { LayoutShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <LayoutShell>
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-3xl tracking-normal md:text-5xl">
            Project foundation ready.
          </CardTitle>
          <CardDescription className="max-w-2xl text-base leading-7">
            This starter includes installable PWA metadata, Tailwind and shadcn
            UI primitives, IndexedDB helpers, Zustand state, path aliases, test
            tooling, and formatting automation without domain-specific logic.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Update the CSS variables in `src/app/globals.css` to white-label the
            theme.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <a href="https://nextjs.org/docs/app" rel="noreferrer">
              App Router docs
              <ArrowRightIcon data-icon="inline-end" />
            </a>
          </Button>
        </CardFooter>
      </Card>
    </LayoutShell>
  );
}
