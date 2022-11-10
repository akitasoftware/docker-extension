import { useEffect, useState } from "react";
import { ContainerInfo, getAkitaContainer, startAkitaAgent } from "../data/queries/container";
import { useAgentConfig } from "./use-agent-config";
import { useDockerDesktopClient } from "./use-docker-desktop-client";

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

  return { config, containerInfo, setIsInitialized };
};
