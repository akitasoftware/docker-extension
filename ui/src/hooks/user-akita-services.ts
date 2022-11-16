import { useEffect, useState } from "react";
import { AgentConfig } from "../data/queries/agent-config";
import { Service, getServices } from "../data/queries/service";
import { useDockerDesktopClient } from "./use-docker-desktop-client";

export const useAkitaServices = (config?: AgentConfig): Service[] => {
  const ddClient = useDockerDesktopClient();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (!config) return;

    getServices(config.api_key, config.api_secret)
      .then((response) => {
        if (response.ok) {
          setServices(response.services);
        } else {
          ddClient.desktopUI.toast.error(`Failed to fetch services: ${response.status}`);
        }
      })
      .catch((e) => ddClient.desktopUI.toast.error(`Failed to fetch services: ${e.message}`));
  }, [ddClient, config]);

  return services;
};
