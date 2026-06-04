"use client";

import { ImagePlus, Loader2, Save, Trash2, UploadCloud } from "lucide-react";
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
const acceptedImageTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const maxImageBytes = 5 * 1024 * 1024;

type UploadSignature = {
  timestamp: number;
  folder: string;
  signature: string;
  cloudName: string;
  apiKey: string;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  url?: string;
  error?: {
    message?: string;
  };
};

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

async function uploadImageFile(file: File) {
  if (!acceptedImageTypes.includes(file.type)) {
    throw new Error("Use a PNG, JPG, WebP, or GIF image.");
  }

  if (file.size > maxImageBytes) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const signatureResponse = await fetch("/api/uploads/signature", {
    method: "POST",
  });

  if (!signatureResponse.ok) {
    const error = (await signatureResponse.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(error?.error ?? "Image uploads are not configured.");
  }

  const signature = (await signatureResponse.json()) as UploadSignature;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("folder", signature.folder);
  formData.append("signature", signature.signature);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );
  const upload = (await uploadResponse.json().catch(() => null)) as
    | CloudinaryUploadResponse
    | null;

  if (!uploadResponse.ok || !upload) {
    throw new Error(upload?.error?.message ?? "Image upload failed.");
  }

  const imageUrl = upload.secure_url ?? upload.url;
  if (!imageUrl) throw new Error("Cloudinary did not return an image URL.");

  return imageUrl;
}

function ImageUploadField({
  label,
  name,
  value,
  onChange,
  preview,
  onUploadingChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (url: string) => void;
  preview?: React.ReactNode;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const hasImage = value.length > 0;

  return (
    <Field label={label} hint="Upload PNG, JPG, WebP, or GIF. Max 5 MB.">
      <input type="hidden" name={name} value={value} />
      <div className="rounded-lg border bg-muted/25 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            {preview ?? (
              <div className="grid size-14 shrink-0 place-items-center rounded-lg border bg-background text-muted-foreground">
                {hasImage ? (
                  <ImagePlus className="size-5" aria-hidden="true" />
                ) : (
                  <UploadCloud className="size-5" aria-hidden="true" />
                )}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {hasImage ? "Image selected" : "No image selected"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {hasImage ? "Ready to save." : "Choose an image file from your device."}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <label className="focus-ring inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border bg-card/80 px-4 text-sm font-medium shadow-sm shadow-slate-950/5 transition hover:bg-muted/70">
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <UploadCloud className="size-4" aria-hidden="true" />
              )}
              {isUploading ? "Uploading" : "Choose file"}
              <input
                type="file"
                accept={acceptedImageTypes.join(",")}
                className="sr-only"
                disabled={isUploading}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;

                  setError("");
                  setIsUploading(true);
                  onUploadingChange?.(true);
                  try {
                    onChange(await uploadImageFile(file));
                  } catch (uploadError) {
                    setError(
                      uploadError instanceof Error
                        ? uploadError.message
                        : "Image upload failed.",
                    );
                  } finally {
                    setIsUploading(false);
                    onUploadingChange?.(false);
                  }
                }}
              />
            </label>
            {hasImage ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setError("");
                  onChange("");
                }}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Remove
              </Button>
            ) : null}
          </div>
        </div>
        {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      </div>
    </Field>
  );
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
  const [bannerUrl, setBannerUrl] = useState(user.bannerUrl ?? "");
  const [uploadsInProgress, setUploadsInProgress] = useState(0);
  const host = appUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const previewAlias = normalizeUsername(alias) || "example";
  const channelUrl = `${host}${profilePath(previewAlias)}`;
  const handleUploadingChange = (uploading: boolean) => {
    setUploadsInProgress((count) => Math.max(0, count + (uploading ? 1 : -1)));
  };

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
          <ImageUploadField
            label="Profile picture"
            name="avatarUrl"
            value={avatarUrl}
            onChange={setAvatarUrl}
            onUploadingChange={handleUploadingChange}
            preview={
              <Avatar
                src={avatarUrl || null}
                name={displayName || previewAlias}
                className="size-14"
              />
            }
          />
          <ImageUploadField
            label="Banner image"
            name="bannerUrl"
            value={bannerUrl}
            onChange={setBannerUrl}
            onUploadingChange={handleUploadingChange}
            preview={
              <div
                className="h-14 w-24 shrink-0 overflow-hidden rounded-lg border bg-muted"
                style={
                  bannerUrl
                    ? {
                        backgroundImage: `url(${bannerUrl})`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                      }
                    : undefined
                }
              >
                {!bannerUrl ? (
                  <div className="grid size-full place-items-center text-muted-foreground">
                    <ImagePlus className="size-5" aria-hidden="true" />
                  </div>
                ) : null}
              </div>
            }
          />
          <Button type="submit" disabled={isPending || uploadsInProgress > 0}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
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
