import { useEffect, useState } from "react";
import { ContainerInfo, getAkitaContainer, startAgentWithRetry } from "../data/queries/container";
import { useAgentConfig } from "./use-agent-config";
import { useDockerDesktopClient } from "./use-docker-desktop-client";

export const useAkitaAgent = () => {
  const client = useDockerDesktopClient();
  const config = useAgentConfig();
  const [containerInfo, setContainerInfo] = useState<ContainerInfo | undefined>();
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasInitializationFailed, setHasInitializationFailed] = useState(false);

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
    if (isInitialized || hasInitializationFailed) return;

    console.log("Trying to start akita agent from useAkitaAgent hook");
    startAgentWithRetry(client, config)
      .then((container) => {
        console.log(
          "Successfully started akita agent from useAkitaAgent hook. container:",
          container
        );
        setContainerInfo(container);
        setIsInitialized(true);
      })
      .catch((e) => {
        console.error(e);
        setHasInitializationFailed(true);
      });
  }, [client, config, hasInitializationFailed, isInitialized]);

  const restartAgent = () => {
    console.log("Restarting agent from useAkitaAgent hook");
    setIsInitialized(false);
  };

  return {
    config,
    containerInfo,
    restartAgent,
    isInitialized,
    hasInitializationFailed,
  };
};
