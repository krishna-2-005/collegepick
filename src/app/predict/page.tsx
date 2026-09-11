import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { PredictView } from "@/components/predict/predict-view";
import { getFilterOptions } from "@/server/colleges";

export const metadata: Metadata = {
  title: "College predictor",
  description: "Enter your JEE, NEET, CAT or GATE rank to see reach, good-chance and safe colleges.",
};

// State list changes only with new colleges.
export const revalidate = 3600;

export default async function PredictPage() {
  const { states } = await getFilterOptions();
  return (
    <Container className="py-8">
      <Suspense>
        <PredictView states={states.map((state) => state.value).sort((a, b) => a.localeCompare(b))} />
      </Suspense>
    </Container>
  );
}
