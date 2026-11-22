// Server-only TinyFish calls, routed through the Lovable connector gateway.
import { FARE_SCHEMA, type FareTask } from "./live-fares";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/udc_tinyfish";

function headers() {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const tinyfishKey = process.env["UDC_TINYFISH_API_KEY"];
  if (!lovableKey || !tinyfishKey) throw new Error("Live fares are not set up yet.");
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": tinyfishKey,
    "Content-Type": "application/json",
  };
}

async function readError(res: Response) {
  const body = await res.text();
  console.error(`TinyFish request failed [${res.status}]: ${body.slice(0, 500)}`);
  if (res.status === 402) return "The live fare service has run out of balance.";
  if (res.status === 429) return "Too many fare checks right now. Please try again in a minute.";
  return `The live fare service is unavailable right now (error ${res.status}).`;
}

export async function startTinyFishRun(task: FareTask) {
  const res = await fetch(`${GATEWAY_URL}/v1/automation/run-async`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      url: task.url,
      goal: task.goal,
      output_schema: FARE_SCHEMA,
      browser_profile: "stealth",
      proxy_config: { enabled: true, type: "tinyfish", country_code: "IN" },
      agent_config: { max_duration_seconds: 180 },
    }),
  });
  if (!res.ok) return { error: await readError(res) };
  const json = (await res.json()) as { run_id?: string; error?: { message?: string } | null };
  if (!json.run_id) return { error: json.error?.message ?? "Couldn't start the fare check." };
  return { runId: json.run_id };
}

export async function getTinyFishRun(runId: string) {
  const res = await fetch(`${GATEWAY_URL}/v1/runs/${encodeURIComponent(runId)}`, {
    headers: headers(),
  });
  if (!res.ok) return { error: await readError(res) };
  return (await res.json()) as {
    status: string;
    result?: unknown;
    error?: { message?: string } | null;
  };
}
