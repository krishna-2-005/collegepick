import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { SavedView } from "@/components/saved/saved-view";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Saved", robots: { index: false } };

export default async function SavedPage() {
  // Middleware already redirects; this is the second line of defence.
  const user = await getSessionUser();
  if (!user) redirect("/login?next=%2Fsaved");

  return (
    <Container className="py-8">
      <Suspense>
        <SavedView firstName={user.name.split(" ")[0] ?? ""} />
      </Suspense>
    </Container>
  );
}
