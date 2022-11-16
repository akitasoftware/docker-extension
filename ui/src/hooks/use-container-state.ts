import { useEffect, useState } from "react";
import { ContainerState, getContainer } from "../data/queries/container";
import { useDockerDesktopClient } from "./use-docker-desktop-client";

export const useContainerState = (
  pollInterval: number,
  containerID?: string
): ContainerState | undefined => {
  const ddClient = useDockerDesktopClient();
  const [containerState, setContainerState] = useState<ContainerState | undefined>();

  useEffect(() => {
    if (!containerID) return;

    const interval = setInterval(() => {
      getContainer(ddClient, containerID)
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
  }, [containerID, ddClient, pollInterval]);

  return containerState;
};
