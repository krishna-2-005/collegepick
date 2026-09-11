import { z } from "zod";
import { EXAMS } from "@/lib/constants";

export const predictQuerySchema = z.object({
  exam: z.enum(EXAMS, { error: "Choose an entrance exam." }),
  rank: z.coerce
    .number({ error: "Enter your rank as a number." })
    .int("Enter a whole number.")
    .min(1, "Ranks start at 1.")
    .max(2_000_000, "That rank is higher than any exam in the data."),
  state: z.string().min(1).max(50).optional(),
});

export type PredictQuery = z.infer<typeof predictQuerySchema>;
