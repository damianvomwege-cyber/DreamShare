import { redirect } from "next/navigation";

import { profilePath } from "@/lib/utils";

function decodeRouteParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: usernameParam } = await params;
  redirect(profilePath(decodeRouteParam(usernameParam)));
}
