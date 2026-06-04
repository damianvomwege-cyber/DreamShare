import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Globe,
  KeyRound,
  Server,
  ShieldCheck,
  UploadCloud,
  XCircle,
} from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import {
  getAdminDiagnostics,
  type DiagnosticCheck,
  type DiagnosticStatus,
} from "@/lib/diagnostics";
import { cn, compactNumber, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusConfig: Record<
  DiagnosticStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  pass: {
    label: "OK",
    icon: CheckCircle2,
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 dark:text-emerald-300",
  },
  warn: {
    label: "Warning",
    icon: AlertTriangle,
    className:
      "border-amber-500/30 bg-amber-500/10 text-amber-300 dark:text-amber-300",
  },
  fail: {
    label: "Error",
    icon: XCircle,
    className: "border-red-500/30 bg-red-500/10 text-red-300 dark:text-red-300",
  },
};

const checkIcons: Record<string, typeof Server> = {
  "auth-secret": KeyRound,
  "database-url": Database,
  "app-urls": Globe,
  cloudinary: UploadCloud,
  database: Database,
  "admin-accounts": ShieldCheck,
};

function StatusBadge({ status }: { status: DiagnosticStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={cn("gap-1.5", config.className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {config.label}
    </Badge>
  );
}

function DiagnosticRow({ check }: { check: DiagnosticCheck }) {
  const Icon = checkIcons[check.id] ?? Server;

  return (
    <Card>
      <CardContent className="grid gap-4 p-5 sm:grid-cols-[2.25rem_minmax(0,1fr)_auto] sm:items-start">
        <div className="flex size-9 items-center justify-center rounded-lg border bg-background/70 text-primary">
          <Icon className="size-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold tracking-normal">
              {check.label}
            </h2>
            <StatusBadge status={check.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{check.summary}</p>
          {check.details.length > 0 ? (
            <ul className="mt-3 grid gap-1 text-xs text-muted-foreground">
              {check.details.map((detail) => (
                <li key={detail} className="font-mono">
                  {detail}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminTestPage() {
  const user = await requireRole("ADMIN");
  const diagnostics = await getAdminDiagnostics();
  const errorCount = diagnostics.checks.filter(
    (check) => check.status === "fail",
  ).length;
  const warningCount = diagnostics.checks.filter(
    (check) => check.status === "warn",
  ).length;
  const metrics = [
    { label: "Errors", value: errorCount },
    { label: "Warnings", value: warningCount },
    { label: "Users", value: diagnostics.counts.users },
    { label: "Dreams", value: diagnostics.counts.dreams },
    { label: "Open reports", value: diagnostics.counts.openReports },
  ];

  return (
    <AdminShell user={user}>
      <div className="space-y-6">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal">
              System Test
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Runtime, auth, database, upload, and admin health checks.
            </p>
          </div>
          <Badge className="gap-1.5">
            <Clock className="size-3.5" aria-hidden="true" />
            {timeAgo(diagnostics.generatedAt)}
          </Badge>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-2xl font-semibold">
                  {compactNumber(metric.value)}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-3">
            {diagnostics.checks.map((check) => (
              <DiagnosticRow key={check.id} check={check} />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Runtime</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                ["Mode", diagnostics.runtime.nodeEnv],
                ["Vercel", diagnostics.runtime.vercelEnv],
                ["Node", diagnostics.runtime.nodeVersion],
                ["Database", diagnostics.runtime.databaseUrl],
                ["Auth URL", diagnostics.runtime.nextAuthUrl],
                ["App URL", diagnostics.runtime.appUrl],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs uppercase text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 break-words font-mono text-xs">{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle>Recent Admin Events</CardTitle>
          </CardHeader>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-y text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {diagnostics.recentLogs.length > 0 ? (
                diagnostics.recentLogs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <Badge>{log.action}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {log.actor}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {log.target}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {timeAgo(log.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No admin events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </AdminShell>
  );
}
