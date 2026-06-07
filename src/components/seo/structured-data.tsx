import { APP_NAME } from "@/lib/constants";
import { absoluteUrl, profilePath } from "@/lib/utils";

export function StructuredData() {
  const data = [
    {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: APP_NAME,
    applicationCategory: "SocialNetworkingApplication",
    operatingSystem: "Any",
    url: absoluteUrl(),
    description:
      "A social platform for sharing, saving, reacting to, and discussing dreams.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: APP_NAME,
      url: absoluteUrl(),
      potentialAction: {
        "@type": "SearchAction",
        target: absoluteUrl("/explore?q={search_term_string}"),
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function DreamStructuredData({
  dream,
}: {
  dream: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    author: {
      username: string;
      displayName: string;
    };
    category: {
      name: string;
    };
  };
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: dream.title,
    description: dream.description,
    datePublished: dream.createdAt.toISOString(),
    dateModified: dream.updatedAt.toISOString(),
    mainEntityOfPage: absoluteUrl(`/dream/${dream.id}`),
    articleSection: dream.category.name,
    keywords: dream.tags,
    author: {
      "@type": "Person",
      name: dream.author.displayName,
      url: absoluteUrl(profilePath(dream.author.username)),
    },
    publisher: {
      "@type": "Organization",
      name: APP_NAME,
      url: absoluteUrl(),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
