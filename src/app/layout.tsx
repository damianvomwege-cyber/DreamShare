import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import { APP_NAME } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: `${APP_NAME} - Share the dreams you wake up remembering`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "DreamShare is a social platform for posting dreams, reacting to dream stories, following dreamers, and exploring trending sleep worlds.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  keywords: [
    "dream journal",
    "dream sharing",
    "lucid dreams",
    "nightmares",
    "social platform",
  ],
  openGraph: {
    title: APP_NAME,
    description:
      "Post dreams, follow dreamers, save favorites, and explore what the world dreamed last night.",
    url: absoluteUrl(),
    siteName: APP_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description:
      "A modern social platform for dreams, reactions, comments, follows, and trending sleep stories.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
