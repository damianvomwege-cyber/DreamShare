import Link from "next/link";

import { verifyEmailAction } from "@/app/actions/auth";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token
    ? await verifyEmailAction(token)
    : { ok: false, message: "Verification token is missing." };

  return (
    <main className="dream-gradient grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{result.ok ? "Email verified" : "Verification failed"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{result.message}</p>
          <ButtonLink href="/login" className="w-full">
            Continue to login
          </ButtonLink>
          <Link className="block text-center text-sm text-primary" href="/">
            Back home
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
