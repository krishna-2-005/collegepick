"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StarRatingInput } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { fieldErrors } from "@/lib/form-errors";
import { reviewInputSchema, type ReviewInput } from "@/lib/validations/reviews";

export type ReviewDraft = { rating: number; title: string; body: string };
export const emptyDraft: ReviewDraft = { rating: 0, title: "", body: "" };

type ReviewFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collegeName: string;
  draft: ReviewDraft;
  onDraftChange: (draft: ReviewDraft) => void;
  /** Shown above the form, e.g. after a failed optimistic publish. */
  formError: string | null;
  onSubmit: (input: ReviewInput) => void;
};

export function ReviewFormDialog({
  open,
  onOpenChange,
  collegeName,
  draft,
  onDraftChange,
  formError,
  onSubmit,
}: ReviewFormDialogProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function update(patch: Partial<ReviewDraft>) {
    const next = { ...draft, ...patch };
    onDraftChange(next);
    if (submitted) {
      const result = reviewInputSchema.safeParse(next);
      setErrors(result.success ? {} : fieldErrors(result.error));
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    const result = reviewInputSchema.safeParse(draft);
    if (!result.success) {
      setErrors(fieldErrors(result.error));
      return;
    }
    setErrors({});
    onSubmit(result.data);
  }

  const bodyLength = draft.body.trim().length;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Write a review"
      description={`Share what studying at ${collegeName} is really like.`}
    >
      <form id="review-form" onSubmit={submit} noValidate className="flex flex-col gap-5">
        {formError ? (
          <FormAlert>{formError}</FormAlert>
        ) : null}
        <StarRatingInput label="Your rating" value={draft.rating} onValueChange={(rating) => update({ rating })} error={errors.rating} />
        <Input
          label="Title"
          placeholder="Strong placements, heavy workload"
          value={draft.title}
          maxLength={100}
          onChange={(event) => update({ title: event.target.value })}
          error={errors.title}
        />
        <Textarea
          label="Your review"
          placeholder="Faculty, placements, campus life, hostel, fees…"
          value={draft.body}
          maxLength={2000}
          rows={5}
          onChange={(event) => update({ body: event.target.value })}
          error={errors.body}
          hint={bodyLength < 30 ? `At least 30 characters (${bodyLength}/30).` : `${bodyLength}/2,000 characters.`}
        />
        <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit">Publish review</Button>
        </div>
      </form>
    </Dialog>
  );
}
