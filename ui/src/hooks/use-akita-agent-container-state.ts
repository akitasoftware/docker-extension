import { useEffect, useState } from "react";
import { ContainerState, getAkitaContainer } from "../data/queries/container";
import { useDockerDesktopClient } from "./use-docker-desktop-client";

export const useAkitaAgentContainerState = (
  pollInterval: number,
): ContainerState | undefined => {
  const ddClient = useDockerDesktopClient();
  const [containerState, setContainerState] = useState<ContainerState | undefined>();

  useEffect(() => {
    const interval = setInterval(() => {
      getAkitaContainer(ddClient)
        .then((container) => {
          if (container) {
            setContainerState(container.State);
          } else {
            setContainerState(ContainerState.NONE);
          }
        })
        .catch((e) => ddClient.desktopUI.toast.error(e.message));
    }, pollInterval);

    return () => clearInterval(interval);
  }, [ddClient, pollInterval]);

  return containerState;
};
