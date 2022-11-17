import { v1 } from "@docker/extension-api-client-types";

export type AgentConfig = {
  api_key: string;
  api_secret: string;
  project_name: string;
  target_port?: number;
  target_container?: string;
  enabled: boolean;
};

export const getAgentConfig = async (ddClient: v1.DockerDesktopClient): Promise<AgentConfig> =>
  (await ddClient.extension.vm?.service?.get("/agents/config")) as AgentConfig;

export const createAgentConfig = async (
  ddClient: v1.DockerDesktopClient,
  config: AgentConfig
): Promise<AgentConfig> => {
  const data = JSON.stringify(config, (key: string, value: any) => {
    if (key === "enabled") {
      return Boolean(value);
    }

    if (!value) {
      return undefined;
    }

    if (key === "target_port") {
      return Number(value);
    }

    return value;
  });

  return (await ddClient.extension.vm?.service?.post("/agents/config", data)) as AgentConfig;
};

export const deleteAgentConfig = async (ddClient: v1.DockerDesktopClient) => {
  await ddClient.extension.vm?.service?.delete("/agents/config");
};
