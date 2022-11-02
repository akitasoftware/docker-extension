import { v1 } from "@docker/extension-api-client-types";

export type AgentConfig = {
  api_key: string;
  api_secret: string;
  project_name: string;
  target_port?: number;
  target_container?: string;
};

export const getAgentConfig = async (
  ddClient: v1.DockerDesktopClient
): Promise<AgentConfig | undefined> =>
  (await ddClient.extension.vm?.service?.get("/agents/config")) as AgentConfig | undefined;

export const createAgentConfig = async (
  ddClient: v1.DockerDesktopClient,
  config: AgentConfig
): Promise<AgentConfig> =>
  (await ddClient.extension.vm?.service?.post("/agents/config", config)) as AgentConfig;

export const deleteAgentConfig = async (ddClient: v1.DockerDesktopClient) => {
  await ddClient.extension.vm?.service?.delete("/agents/config");
};
