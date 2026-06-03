"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useState, useTransition } from "react";

import {
  forgotPasswordAction,
  registerAction,
  resetPasswordAction,
  setupOwnerAction,
  type ActionState,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form";

const initialState: ActionState = { ok: false, message: "" };

function PasswordField({
  name = "password",
  label = "Password",
}: {
  name?: string;
  label?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <Field label={label}>
      <div className="relative">
        <Input
          name={name}
          type={visible ? "text" : "password"}
          required
          autoComplete={name === "password" ? "current-password" : "new-password"}
          className="pr-11"
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          className="focus-ring absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground"
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </Field>
  );
}

function FormMessage({ state }: { state: ActionState }) {
  if (!state.message) return null;

  return (
    <div
      className={`rounded-lg border p-3 text-sm ${
        state.ok
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-destructive/30 bg-destructive/10 text-destructive"
      }`}
      role="status"
    >
      <p>{state.message}</p>
      {state.devToken ? (
        <p className="mt-2 break-all font-mono text-xs">
          Dev token: {state.devToken}
        </p>
      ) : null}
    </div>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <Card className="premium-border overflow-hidden">
      <CardHeader className="border-b bg-background/42">
        <CardTitle>Log in to DreamShare</CardTitle>
        <p className="text-sm text-muted-foreground">
          Continue sharing, saving, and following dreams.
        </p>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            setError("");
            startTransition(async () => {
              const response = await signIn("credentials", {
                identifier: String(formData.get("identifier")),
                password: String(formData.get("password")),
                redirect: false,
                callbackUrl,
              });

              if (response?.ok) {
                router.push(callbackUrl);
                router.refresh();
              } else {
                setError(response?.error || "Invalid login credentials.");
              }
            });
          }}
        >
          {searchParams.get("setup") === "complete" ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
              Owner account created. Log in to open the admin dashboard.
            </div>
          ) : null}
          {searchParams.get("registered") ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
              Account created. You can sign in now.
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}
          <Field label="Email or username">
            <Input name="identifier" required autoComplete="username" />
          </Field>
          <PasswordField />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Login
          </Button>
        </form>
        <div className="mt-5 flex items-center justify-between text-sm">
          <Link className="text-primary hover:underline" href="/forgot-password">
            Forgot password?
          </Link>
          <Link className="text-primary hover:underline" href="/register">
            Create account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function RegisterForm() {
  const [state, action, isPending] = useActionState(registerAction, initialState);

  return (
    <Card className="premium-border overflow-hidden">
      <CardHeader className="border-b bg-background/42">
        <CardTitle>Create your DreamShare account</CardTitle>
        <p className="text-sm text-muted-foreground">
          Pick a username that other dreamers can follow.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" action={action}>
          <FormMessage state={state} />
          <Field label="Display name">
            <Input name="displayName" required autoComplete="name" />
          </Field>
          <Field label="Username" hint="At least 3 characters. Up to 2 spaces allowed.">
            <Input name="username" required autoComplete="username" />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" required autoComplete="email" />
          </Field>
          <PasswordField />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Register
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link className="text-primary hover:underline" href="/login">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export function ForgotPasswordForm() {
  const [state, action, isPending] = useActionState(
    forgotPasswordAction,
    initialState,
  );

  return (
    <Card className="premium-border overflow-hidden">
      <CardHeader className="border-b bg-background/42">
        <CardTitle>Reset your password</CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your email and DreamShare will generate a reset token.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" action={action}>
          <FormMessage state={state} />
          <Field label="Email">
            <Input name="email" type="email" required autoComplete="email" />
          </Field>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Send reset link
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function ResetPasswordForm({ token }: { token?: string }) {
  const [state, action, isPending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  return (
    <Card className="premium-border overflow-hidden">
      <CardHeader className="border-b bg-background/42">
        <CardTitle>Choose a new password</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" action={action}>
          <FormMessage state={state} />
          <input type="hidden" name="token" value={token ?? ""} />
          <PasswordField />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function SetupOwnerForm() {
  const [state, action, isPending] = useActionState(
    setupOwnerAction,
    initialState,
  );

  return (
    <Card className="premium-border overflow-hidden">
      <CardHeader className="border-b bg-background/42">
        <CardTitle>Secure first-launch setup</CardTitle>
        <p className="text-sm text-muted-foreground">
          Create the first Owner account. This page is disabled after setup.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" action={action}>
          <FormMessage state={state} />
          <Field label="Display name">
            <Input name="displayName" required defaultValue="DreamShare Owner" />
          </Field>
          <Field label="Username" hint="At least 3 characters. Up to 2 spaces allowed.">
            <Input name="username" required autoComplete="username" />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" required autoComplete="email" />
          </Field>
          <PasswordField />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Complete setup
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
