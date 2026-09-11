"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Container } from "@/components/layout/container";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="py-16 md:py-24">
      <EmptyState
        icon={<TriangleAlert />}
        title="This page couldn't load"
        description="We couldn't reach the server or the data came back incomplete. Try again; if it keeps failing, come back in a few minutes."
        action={
          <>
            <Button onClick={reset}>Try again</Button>
            <ButtonLink href="/" variant="secondary">
              Go to home
            </ButtonLink>
          </>
        }
      />
      {error.digest ? (
        <p className="mt-4 text-center text-xs text-ink-muted">Error reference: {error.digest}</p>
      ) : null}
    </Container>
  );
}
