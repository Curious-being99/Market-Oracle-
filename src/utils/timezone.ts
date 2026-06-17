export function formatTimestamp(timestampMs: number | string, tz: string): string {
  const date = new Date(Number(timestampMs));
  let resolvedTz = tz;
  if (tz === "local") {
    resolvedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return date.toLocaleTimeString([], { timeZone: resolvedTz });
}

export interface SessionMarker {
  name: string;
  color: string;
  short: string;
}

export function getSessionMarker(timestampMs: number | string, timeframeMin = 1): SessionMarker | null {
  const d = new Date(Number(timestampMs));
  const hour = d.getUTCHours();
  const min = d.getUTCMinutes();
  
  // Checking if the session starts within the timeframe interval
  if (min < timeframeMin) {
    if (hour === 0) return { name: "Tokyo Open", color: "#10B981", short: "TYO" };
    if (hour === 8) return { name: "London Open", color: "#3B82F6", short: "LON" };
    if (hour === 13) return { name: "New York Open", color: "#EF4444", short: "NYC" };
  }
  return null;
}

