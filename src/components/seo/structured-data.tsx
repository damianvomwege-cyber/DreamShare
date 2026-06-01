import { APP_NAME } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";

export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: APP_NAME,
    applicationCategory: "SocialNetworkingApplication",
    operatingSystem: "Any",
    url: absoluteUrl(),
    description:
      "A social platform for sharing, saving, reacting to, and discussing dreams.",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
