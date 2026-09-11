import { ok, route } from "@/lib/api-response";
import { getFilterOptions } from "@/server/colleges";

// Filter options change only when colleges are added; rebuild at most hourly.
export const revalidate = 3600;

export const GET = route(async () => ok(await getFilterOptions()));
