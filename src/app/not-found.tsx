import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Container className="py-16 md:py-24">
      <EmptyState
        icon={<SearchX />}
        title="Page not found"
        description="This page doesn't exist or has moved. Check the address, or start again from the college list."
        action={
          <>
            <ButtonLink href="/colleges">Browse colleges</ButtonLink>
            <ButtonLink href="/" variant="secondary">
              Go to home
            </ButtonLink>
          </>
        }
      />
    </Container>
  );
}
