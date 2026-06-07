import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Providers } from "@/components/layout/providers";
import { APP_NAME } from "@/lib/constants";
import { defaultOgImage, defaultSeoDescription } from "@/lib/seo";
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

const themeInitScript = `
(function() {
  try {
    var theme = window.localStorage.getItem("dreamshare-theme");
    if (theme !== "dark" && theme !== "light") {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    var root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
    root.style.colorScheme = theme;
  } catch (_) {}
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: `${APP_NAME} - Share the dreams you wake up remembering`,
    template: `%s | ${APP_NAME}`,
  },
  description: defaultSeoDescription(),
  applicationName: APP_NAME,
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
    description: defaultSeoDescription(),
    url: absoluteUrl(),
    siteName: APP_NAME,
    type: "website",
    images: [
      {
        url: defaultOgImage(),
        width: 1200,
        height: 630,
        alt: `${APP_NAME} social dream journal`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: defaultSeoDescription(),
    images: [defaultOgImage()],
  },
  robots: {
    index: true,
    follow: true,
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
        <Script
          id="dreamshare-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
