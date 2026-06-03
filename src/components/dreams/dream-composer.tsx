"use client";

import { CloudMoon, Loader2, Send } from "lucide-react";
import { useActionState } from "react";

import { createDreamAction, type DreamActionState } from "@/app/actions/dreams";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import type { Category, DreamMood } from "@/generated/prisma/client";
import { DREAM_VISIBILITIES, MOOD_LABELS } from "@/lib/constants";

const initialState: DreamActionState = { ok: false, message: "" };

export function DreamComposer({
  categories,
  signedIn,
}: {
  categories: Category[];
  signedIn: boolean;
}) {
  const [state, action, isPending] = useActionState(
    createDreamAction,
    initialState,
  );

  return (
    <Card id="compose" className="premium-border overflow-hidden">
      <CardHeader className="border-b bg-background/42">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
            <CloudMoon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle>What did you dream?</CardTitle>
            <p className="text-sm text-muted-foreground">
              Capture the details before they fade.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {signedIn ? (
          <form action={action} className="space-y-4">
            {state.message ? (
              <div
                className={`rounded-lg border p-3 text-sm ${
                  state.ok
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
                role="status"
              >
                {state.message}
              </div>
            ) : null}
            <Field label="Title">
              <Input
                name="title"
                required
                maxLength={140}
                placeholder="A train station under the ocean"
              />
            </Field>
            <Field label="Dream description">
              <Textarea
                name="description"
                required
                maxLength={6000}
                className="min-h-40"
                placeholder="Write what happened, how it felt, and what you remember most."
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Category">
                <Select name="categoryId" required defaultValue={categories[0]?.id}>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Mood">
                <Select name="mood" defaultValue="SURREAL">
                  {(Object.keys(MOOD_LABELS) as DreamMood[]).map((mood) => (
                    <option key={mood} value={mood}>
                      {MOOD_LABELS[mood]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Visibility">
                <Select name="visibility" defaultValue="PUBLIC">
                  {DREAM_VISIBILITIES.map((visibility) => (
                    <option key={visibility.value} value={visibility.value}>
                      {visibility.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Tags" hint="Separate tags with commas.">
              <Input name="tags" placeholder="ocean, train, blue light" />
            </Field>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
              Post dream
            </Button>
          </form>
        ) : (
          <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
            Log in or create an account to post dreams, comment, follow, and save.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
