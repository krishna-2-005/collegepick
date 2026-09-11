import { SearchX } from "lucide-react";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function CollegeNotFound() {
  return (
    <Container className="py-16 md:py-24">
      <EmptyState
        icon={<SearchX />}
        title="We couldn't find that college"
        description="The link may be mistyped, or the college was removed. Search the list to find it."
        action={<ButtonLink href="/colleges">Browse colleges</ButtonLink>}
      />
    </Container>
  );
}
