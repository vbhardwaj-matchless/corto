import { APIResponse } from "@playwright/test";

export async function assertResponseTime(
  response: APIResponse,
  maxMs: number,
): Promise<void> {
  // Playwright does not expose timing directly, so use Date.now() diff if available
  const timing = response.timing ? response.timing() : undefined;
  let duration = 0;
  if (timing && timing.startTime && timing.endTime) {
    duration = timing.endTime - timing.startTime;
  } else {
    // Fallback: try to read from headers
    const header = response.headers()["x-response-time"];
    if (header) {
      duration = parseInt(header, 10);
    }
  }
  if (!duration || isNaN(duration)) {
    throw new Error("Response time could not be determined");
  }
  if (duration > maxMs) {
    throw new Error(
      `Response time ${duration}ms exceeded budget of ${maxMs}ms`,
    );
  }
}
