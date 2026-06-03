"use client";

import { Loader2, Save } from "lucide-react";
import { useActionState, useState } from "react";

import {
  updateNotificationSettingsAction,
  updatePrivacySettingsAction,
  updateProfileSettingsAction,
  type SettingsActionState,
} from "@/app/actions/settings";
import { Avatar } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/form";
import { cn, normalizeUsername, profilePath } from "@/lib/utils";

const initialState: SettingsActionState = { ok: false, message: "" };

function Message({ state }: { state: SettingsActionState }) {
  if (!state.message) return null;
  return (
    <p className={`text-sm ${state.ok ? "text-emerald-600" : "text-destructive"}`}>
      {state.message}
    </p>
  );
}

function editableAlias(value: string) {
  return value.replace(/^\s*@+/, "");
}

export function ProfileSettingsForm({
  appUrl,
  user,
}: {
  appUrl: string;
  user: {
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
  };
}) {
  const [state, action, isPending] = useActionState(
    updateProfileSettingsAction,
    initialState,
  );
  const [displayName, setDisplayName] = useState(user.displayName);
  const [alias, setAlias] = useState(user.username);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const host = appUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const previewAlias = normalizeUsername(alias) || "example";
  const channelUrl = `${host}${profilePath(previewAlias)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <Message state={state} />
          <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-3">
            <Avatar
              src={avatarUrl || null}
              name={displayName || previewAlias}
              className="size-16 text-lg"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{displayName || "Display name"}</p>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {channelUrl}
              </p>
            </div>
          </div>
          <Field label="Display name">
            <Input
              name="displayName"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              required
              autoComplete="name"
            />
          </Field>
          <Field
            label="Channel alias"
            hint="At least 3 characters. The public link always starts with @."
          >
            <div
              className={cn(
                "focus-within:ring-ring flex h-10 w-full items-center overflow-hidden rounded-lg border bg-background/80 text-sm shadow-inner shadow-slate-950/5 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-background",
              )}
            >
              <span className="grid h-full place-items-center border-r bg-muted/60 px-3 font-mono text-muted-foreground">
                @
              </span>
              <input
                name="username"
                value={alias}
                onChange={(event) => setAlias(editableAlias(event.target.value))}
                required
                autoComplete="username"
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-foreground outline-none placeholder:text-muted-foreground"
                placeholder="example"
              />
            </div>
            <p className="break-all font-mono text-xs text-muted-foreground">
              {channelUrl}
            </p>
          </Field>
          <Field label="Bio">
            <Textarea name="bio" defaultValue={user.bio ?? ""} maxLength={280} />
          </Field>
          <Field label="Profile picture URL">
            <Input
              name="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://..."
            />
          </Field>
          <Field label="Banner URL">
            <Input name="bannerUrl" type="url" defaultValue={user.bannerUrl ?? ""} />
          </Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function PrivacySettingsForm({
  user,
}: {
  user: { privateProfile: boolean; showSavedDreams: boolean };
}) {
  const [state, action, isPending] = useActionState(
    updatePrivacySettingsAction,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <Message state={state} />
          <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
            <input
              type="checkbox"
              name="privateProfile"
              defaultChecked={user.privateProfile}
              className="mt-1"
            />
            <span>
              <span className="block font-medium">Private profile</span>
              <span className="text-muted-foreground">
                Only followers can see profile dream lists.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
            <input
              type="checkbox"
              name="showSavedDreams"
              defaultChecked={user.showSavedDreams}
              className="mt-1"
            />
            <span>
              <span className="block font-medium">Show saved dreams</span>
              <span className="text-muted-foreground">
                Let other people see your saved dreams count.
              </span>
            </span>
          </label>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save privacy
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function NotificationSettingsForm({
  user,
}: {
  user: { emailNotifications: boolean; pushNotifications: boolean };
}) {
  const [state, action, isPending] = useActionState(
    updateNotificationSettingsAction,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <Message state={state} />
          <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
            <input
              type="checkbox"
              name="emailNotifications"
              defaultChecked={user.emailNotifications}
              className="mt-1"
            />
            <span>Email notifications</span>
          </label>
          <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
            <input
              type="checkbox"
              name="pushNotifications"
              defaultChecked={user.pushNotifications}
              className="mt-1"
            />
            <span>In-app notifications</span>
          </label>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save notifications
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function SecuritySettingsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Password resets are token-based and expire after one hour.
        </p>
        <ButtonLink href="/forgot-password" variant="secondary">
          Reset password
        </ButtonLink>
      </CardContent>
    </Card>
  );
}
