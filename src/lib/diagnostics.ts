import { getPrisma } from "@/lib/prisma";

export type DiagnosticStatus = "pass" | "warn" | "fail";

export type DiagnosticCheck = {
  id: string;
  label: string;
  status: DiagnosticStatus;
  summary: string;
  details: string[];
};

export type DiagnosticLog = {
  id: string;
  action: string;
  actor: string;
  target: string;
  createdAt: Date;
};

export type DiagnosticSnapshot = {
  generatedAt: Date;
  runtime: {
    nodeEnv: string;
    vercelEnv: string;
    nodeVersion: string;
    databaseUrl: string;
    nextAuthUrl: string;
    appUrl: string;
  };
  counts: {
    users: number;
    admins: number;
    owners: number;
    dreams: number;
    comments: number;
    categories: number;
    openReports: number;
  };
  checks: DiagnosticCheck[];
  recentLogs: DiagnosticLog[];
};

function envValue(key: string) {
  const value = process.env[key]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function publicUrlSummary(value?: string) {
  if (!value) return "Not set";

  try {
    const url = new URL(value);
    const path = url.pathname === "/" ? "" : url.pathname;
    return `${url.protocol}//${url.host}${path}`;
  } catch {
    return "Invalid URL";
  }
}

function safeError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return message
    .replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, "postgresql://<redacted>")
    .replace(/password=[^&\s"']+/gi, "password=<redacted>")
    .slice(0, 420);
}

function statusFromRequiredEnv(value: string | undefined, minLength = 1) {
  if (!value) return "fail" satisfies DiagnosticStatus;
  if (value.length < minLength) return "warn" satisfies DiagnosticStatus;
  return "pass" satisfies DiagnosticStatus;
}

function check(
  id: string,
  label: string,
  status: DiagnosticStatus,
  summary: string,
  details: string[] = [],
): DiagnosticCheck {
  return { id, label, status, summary, details };
}

export async function getAdminDiagnostics(): Promise<DiagnosticSnapshot> {
  const checks: DiagnosticCheck[] = [];
  const databaseUrl = envValue("DATABASE_URL");
  const nextAuthSecret = envValue("NEXTAUTH_SECRET");
  const nextAuthUrl = envValue("NEXTAUTH_URL");
  const appUrl = envValue("NEXT_PUBLIC_APP_URL");
  const cloudinaryValues = [
    envValue("CLOUDINARY_CLOUD_NAME"),
    envValue("CLOUDINARY_API_KEY"),
    envValue("CLOUDINARY_API_SECRET"),
  ];
  const counts = {
    users: 0,
    admins: 0,
    owners: 0,
    dreams: 0,
    comments: 0,
    categories: 0,
    openReports: 0,
  };
  let recentLogs: DiagnosticLog[] = [];

  const secretStatus = statusFromRequiredEnv(nextAuthSecret, 32);
  checks.push(
    check(
      "auth-secret",
      "NextAuth secret",
      secretStatus,
      secretStatus === "pass"
        ? "JWT sessions can be signed securely."
        : secretStatus === "warn"
          ? "NEXTAUTH_SECRET exists but is shorter than recommended."
          : "NEXTAUTH_SECRET is missing.",
      [
        `Configured length: ${nextAuthSecret?.length ?? 0}`,
        "Recommended minimum: 32 characters.",
      ],
    ),
  );

  let databaseUrlStatus: DiagnosticStatus = databaseUrl ? "pass" : "fail";
  let databaseUrlDetails = ["DATABASE_URL is missing."];

  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      databaseUrlDetails = [
        `Host: ${url.hostname}`,
        `Port: ${url.port || "5432"}`,
        `Database: ${url.pathname.replace("/", "") || "default"}`,
      ];
    } catch {
      databaseUrlStatus = "fail";
      databaseUrlDetails = ["DATABASE_URL is not a valid URL."];
    }
  }

  checks.push(
    check(
      "database-url",
      "Database URL",
      databaseUrlStatus,
      databaseUrlStatus === "pass"
        ? "Database connection string is configured."
        : "Database connection string needs attention.",
      databaseUrlDetails,
    ),
  );

  const appUrlStatus =
    nextAuthUrl && appUrl
      ? nextAuthUrl === appUrl
        ? "pass"
        : "warn"
      : process.env.NODE_ENV === "production"
        ? "fail"
        : "warn";

  checks.push(
    check(
      "app-urls",
      "App URLs",
      appUrlStatus,
      appUrlStatus === "pass"
        ? "Auth and public app URLs match."
        : "Check NEXTAUTH_URL and NEXT_PUBLIC_APP_URL.",
      [
        `NEXTAUTH_URL: ${publicUrlSummary(nextAuthUrl)}`,
        `NEXT_PUBLIC_APP_URL: ${publicUrlSummary(appUrl)}`,
      ],
    ),
  );

  const missingCloudinary = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ].filter((_, index) => !cloudinaryValues[index]);

  checks.push(
    check(
      "cloudinary",
      "Cloudinary uploads",
      missingCloudinary.length === 0 ? "pass" : "warn",
      missingCloudinary.length === 0
        ? "Profile image uploads are configured."
        : "Image uploads will be disabled until Cloudinary env vars are set.",
      missingCloudinary.length === 0
        ? ["All required Cloudinary keys are present."]
        : [`Missing: ${missingCloudinary.join(", ")}`],
    ),
  );

  if (databaseUrlStatus === "pass") {
    try {
      const prisma = getPrisma();
      await prisma.$queryRaw`SELECT 1`;

      const [
        users,
        admins,
        owners,
        dreams,
        comments,
        categories,
        openReports,
        logs,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: { in: ["ADMIN", "OWNER"] } } }),
        prisma.user.count({ where: { role: "OWNER" } }),
        prisma.dream.count({ where: { status: { not: "DELETED" } } }),
        prisma.comment.count({ where: { deletedAt: null } }),
        prisma.category.count(),
        prisma.report.count({ where: { status: { in: ["OPEN", "REVIEWING"] } } }),
        prisma.adminLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            actor: {
              select: {
                username: true,
                displayName: true,
              },
            },
          },
        }),
      ]);

      counts.users = users;
      counts.admins = admins;
      counts.owners = owners;
      counts.dreams = dreams;
      counts.comments = comments;
      counts.categories = categories;
      counts.openReports = openReports;
      recentLogs = logs.map((log) => ({
        id: log.id,
        action: log.action,
        actor: log.actor
          ? `${log.actor.displayName} @${log.actor.username}`
          : "System",
        target: [log.targetType, log.targetId].filter(Boolean).join(" ") || "-",
        createdAt: log.createdAt,
      }));

      checks.push(
        check("database", "Database health", "pass", "Database is reachable.", [
          `Users: ${users}`,
          `Dreams: ${dreams}`,
          `Categories: ${categories}`,
        ]),
      );

      checks.push(
        check(
          "admin-accounts",
          "Admin accounts",
          owners > 0 ? "pass" : admins > 0 ? "warn" : "fail",
          owners > 0
            ? "At least one owner account exists."
            : admins > 0
              ? "Admins exist, but no owner account was found."
              : "No admin or owner account was found.",
          [`Admins/Owners: ${admins}`, `Owners: ${owners}`],
        ),
      );
    } catch (error) {
      checks.push(
        check("database", "Database health", "fail", "Database check failed.", [
          safeError(error),
        ]),
      );
    }
  }

  return {
    generatedAt: new Date(),
    runtime: {
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      vercelEnv: process.env.VERCEL_ENV ?? "local",
      nodeVersion: process.version,
      databaseUrl: publicUrlSummary(databaseUrl),
      nextAuthUrl: publicUrlSummary(nextAuthUrl),
      appUrl: publicUrlSummary(appUrl),
    },
    counts,
    checks,
    recentLogs,
  };
}
