"use client";

import { Loader2, Save } from "lucide-react";
import { useActionState } from "react";

import {
  updateNotificationSettingsAction,
  updatePrivacySettingsAction,
  updateProfileSettingsAction,
  type SettingsActionState,
} from "@/app/actions/settings";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/form";

const initialState: SettingsActionState = { ok: false, message: "" };

function Message({ state }: { state: SettingsActionState }) {
  if (!state.message) return null;
  return (
    <p className={`text-sm ${state.ok ? "text-emerald-600" : "text-destructive"}`}>
      {state.message}
    </p>
  );
}

export function ProfileSettingsForm({
  user,
}: {
  user: {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <Message state={state} />
          <Field label="Display name">
            <Input name="displayName" defaultValue={user.displayName} required />
          </Field>
          <Field label="Bio">
            <Textarea name="bio" defaultValue={user.bio ?? ""} maxLength={280} />
          </Field>
          <Field label="Avatar URL">
            <Input name="avatarUrl" type="url" defaultValue={user.avatarUrl ?? ""} />
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
