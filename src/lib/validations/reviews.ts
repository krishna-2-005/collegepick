import { z } from "zod";

export const reviewListQuerySchema = z.object({
  cursor: z.string().max(300).optional(),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export const reviewInputSchema = z.object({
  rating: z
    .number({ error: "Choose a rating from 1 to 5 stars." })
    .int("Choose a rating from 1 to 5 stars.")
    .min(1, "Choose a rating from 1 to 5 stars.")
    .max(5, "Choose a rating from 1 to 5 stars."),
  title: z
    .string({ error: "Add a title." })
    .trim()
    .min(4, "Use at least 4 characters for the title.")
    .max(100, "Keep the title under 100 characters."),
  body: z
    .string({ error: "Write your review." })
    .trim()
    .min(30, "Write at least 30 characters so others can learn from it.")
    .max(2000, "Keep the review under 2,000 characters."),
});

export type ReviewInput = z.infer<typeof reviewInputSchema>;
