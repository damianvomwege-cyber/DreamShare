import { ImageResponse } from "next/og";

import { APP_NAME, MOOD_LABELS } from "@/lib/constants";
import { getPublicDreamSeo, truncateForSeo } from "@/lib/seo";

export const alt = "DreamShare dream story";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dream = await getPublicDreamSeo(id);
  const title = dream?.title ?? "DreamShare";
  const description = dream
    ? truncateForSeo(dream.description, 180)
    : "A public dream story shared on DreamShare.";
  const author = dream
    ? `${dream.author.displayName} @${dream.author.username}`
    : APP_NAME;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #020617 0%, #0f172a 48%, #155e75 100%)",
          color: "#f8fafc",
          padding: 58,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 58,
                height: 58,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 16,
                background: "#22d3ee",
                color: "#04111f",
                fontSize: 36,
                fontWeight: 900,
              }}
            >
              D
            </div>
            <div style={{ fontSize: 30, fontWeight: 800 }}>{APP_NAME}</div>
          </div>

          {dream ? (
            <div
              style={{
                display: "flex",
                gap: 12,
                color: "#bae6fd",
                fontSize: 22,
              }}
            >
              <span>{dream.category.name}</span>
              <span>-</span>
              <span>{MOOD_LABELS[dream.mood]}</span>
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              maxWidth: 980,
              fontSize: title.length > 58 ? 56 : 72,
              lineHeight: 1,
              fontWeight: 900,
              letterSpacing: 0,
            }}
          >
            {title}
          </div>
          <div
            style={{
              maxWidth: 920,
              color: "#cbd5e1",
              fontSize: 26,
              lineHeight: 1.35,
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#e0f2fe",
            fontSize: 24,
          }}
        >
          <span>{author}</span>
          {dream ? (
            <span>
              {dream.likeCount} reactions - {dream.commentCount} comments -{" "}
              {dream.shareCount} shares
            </span>
          ) : (
            <span>dreamshare.vercel.app</span>
          )}
        </div>
      </div>
    ),
    size,
  );
}
