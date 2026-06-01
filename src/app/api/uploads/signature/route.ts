import { jsonError, jsonOk } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { createUploadSignature } from "@/lib/cloudinary";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  try {
    return jsonOk(createUploadSignature({ folder: `dreamshare/${user.id}` }));
  } catch {
    return jsonError("Cloudinary is not configured.", 503);
  }
}
