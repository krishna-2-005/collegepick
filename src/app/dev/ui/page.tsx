import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { Playground } from "./playground";

export const metadata: Metadata = {
  title: "Component kit",
  robots: { index: false, follow: false },
};

export default function DevUiPage() {
  return (
    <Container className="py-12">
      <header className="flex max-w-[70ch] flex-col gap-2">
        <h1 className="text-3xl">Component kit</h1>
        <p className="text-ink-muted">
          Every component in <code className="text-ink">src/components/ui</code>, with its variants
          and states. Tokens, type scale and components here are the only building blocks pages use.
        </p>
      </header>
      <Playground />
    </Container>
  );
}
