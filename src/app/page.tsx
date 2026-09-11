import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";

export default function HomePage() {
  return (
    <Container className="py-16 md:py-24">
      <h1 className="max-w-[22ch] text-3xl md:text-4xl">
        Find the college that fits you, not just the one that ranks.
      </h1>
      <p className="mt-5 max-w-[60ch] text-lg text-ink-muted">
        Compare fees, placements and real student reviews side by side, then shortlist the
        colleges worth applying to.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/colleges">Browse colleges</ButtonLink>
        <ButtonLink href="/dev/ui" variant="secondary">
          View the component kit
        </ButtonLink>
      </div>
    </Container>
  );
}
