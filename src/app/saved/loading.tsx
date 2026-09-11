import { CollegeCardSkeleton, CollegeGrid } from "@/components/college/college-card";
import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function SavedLoading() {
  return (
    <Container className="flex flex-col gap-6 py-8" aria-busy="true" aria-label="Loading saved items">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-5 w-72" />
      </div>
      <Skeleton className="h-11 w-80" />
      <CollegeGrid>
        {Array.from({ length: 3 }, (_, index) => (
          <CollegeCardSkeleton key={index} />
        ))}
      </CollegeGrid>
    </Container>
  );
}
