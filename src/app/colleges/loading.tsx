import { ListingSkeleton } from "@/components/college/listing-skeleton";
import { Container } from "@/components/layout/container";

export default function ListingLoading() {
  return (
    <Container className="py-8">
      <ListingSkeleton />
    </Container>
  );
}
