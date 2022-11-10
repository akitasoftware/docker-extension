import { useEffect, useState } from "react";
import { AgentConfig, getAgentConfig } from "../data/queries/agent-config";
import { ContainerInfo, getAkitaContainer, startAkitaAgent } from "../data/queries/container";
import { useDockerDesktopClient } from "./use-docker-desktop-client";

const useAgentConfig = (): AgentConfig | undefined => {
  const ddClient = useDockerDesktopClient();
  const [agentConfig, setAgentConfig] = useState<AgentConfig | undefined>();
  useEffect(() => {
    void getAgentConfig(ddClient).then(setAgentConfig);
  }, [ddClient]);
  return agentConfig;
};

export const useAkitaAgent = () => {
  const client = useDockerDesktopClient();
  const config = useAgentConfig();
  const [containerInfo, setContainerInfo] = useState<ContainerInfo | undefined>();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!config) return;

    getAkitaContainer(client)
      .then((container) => {
        if (container) {
          setContainerInfo(container);
          setIsInitialized(true);
          return;
        }

        setIsInitialized(false);
      })
      .catch(console.error);
  }, [client, config]);

  useEffect(() => {
    if (isInitialized) return;

    startAkitaAgent(client, config).catch(console.error);

    const interval = setInterval(() => {
      getAkitaContainer(client)
        .then((container) => {
          if (container) {
            setContainerInfo(container);
            setIsInitialized(true);
            clearInterval(interval);
          }
        })
        .catch(console.error);
    }, 1000);

    return () => clearInterval(interval);
  }, [client, config, isInitialized]);

  return { config, containerInfo };
};
