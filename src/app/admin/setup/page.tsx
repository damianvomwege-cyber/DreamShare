import { redirect } from "next/navigation";

import { SetupOwnerForm } from "@/components/auth/auth-forms";
import { ensureDefaultOwnerFromEnv, hasAdminAccount } from "@/lib/setup";

export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  const defaultOwner = await ensureDefaultOwnerFromEnv();
  if (defaultOwner) redirect("/login?setup=complete&callbackUrl=/admin");
  if (await hasAdminAccount()) redirect("/login?callbackUrl=/admin");

  return (
    <main className="dream-gradient grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <SetupOwnerForm />
      </div>
    </main>
  );
}
