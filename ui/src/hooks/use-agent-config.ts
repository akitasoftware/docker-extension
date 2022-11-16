import { useEffect, useState } from "react";
import { AgentConfig, getAgentConfig } from "../data/queries/agent-config";
import { useDockerDesktopClient } from "./use-docker-desktop-client";

export const useAgentConfig = () => {
  const ddClient = useDockerDesktopClient();
  const [config, setConfig] = useState<AgentConfig | undefined>(undefined);

  useEffect(() => {
    if (config) return;

    getAgentConfig(ddClient)
      .then((config) => setConfig(config))
      .catch(console.error);
  }, [config, ddClient]);

  return config;
};
