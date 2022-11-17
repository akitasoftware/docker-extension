import { v1 } from "@docker/extension-api-client-types";

export type AnalyticsEvent = {
  distinct_id: string;
  name: string;
  properties: Record<string, any>;
};

export const postAnalyticsEvent = async (
  ddClient: v1.DockerDesktopClient,
  event: AnalyticsEvent
) => {
  const data = JSON.stringify(event);
  return await ddClient.extension.vm?.service?.post("/analytics/event", data);
};
