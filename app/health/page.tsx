import { headers } from "next/headers";

interface HealthPayload {
  status: string;
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  nodeVersion: string;
  region: string;
}

async function resolveHealthUrl(): Promise<string> {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  if (base) {
    return `${base}/api/health`;
  }
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}/api/health`;
}

function HealthRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="font-mono text-sm text-slate-900">{value}</dd>
    </div>
  );
}

export default async function HealthPage() {
  let health: HealthPayload | null = null;
  let error: string | null = null;

  try {
    const url = await resolveHealthUrl();
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Health endpoint replied ${response.status}.`);
    }
    health = (await response.json()) as HealthPayload;
  } catch (cause) {
    error = cause instanceof Error ? cause.message : "Unknown health check failure.";
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Health check</h1>
        <p className="mt-2 text-red-600" role="alert">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold">Health check</h1>
      <p className="mt-2 text-slate-600">
        Live status fetched from <code className="font-mono text-xs">/api/health</code>.
      </p>
      <dl
        role="status"
        className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-4"
      >
        <HealthRow label="Status" value={health.status} />
        <HealthRow label="Service" value={health.service} />
        <HealthRow label="Checked at" value={health.timestamp} />
        <HealthRow label="Uptime" value={`${health.uptimeSeconds}s`} />
        <HealthRow label="Node" value={health.nodeVersion} />
        <HealthRow label="Region" value={health.region} />
      </dl>
    </div>
  );
}