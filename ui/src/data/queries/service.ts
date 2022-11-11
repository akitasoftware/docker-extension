import { useEffect, useState } from "react";
import { useDockerDesktopClient } from "../../hooks/use-docker-desktop-client";
import { AgentConfig } from "./agent-config";
import { AkitaURL, addAuthHeader } from "./utils";

export interface Service {
  name: string;
}

export interface ServiceResponse {
  services: Service[];
  status: number;
  ok: boolean;
}

export const getServices = async (apiKey: string, apiSecret: string): Promise<ServiceResponse> => {
  const headers = new Headers();
  addAuthHeader(headers, apiKey, apiSecret);

  const response = await fetch(`${AkitaURL}/v1/services`, { headers });
  const body = await response.json();

  return {
    services: response.ok ? (body as Service[]) : [],
    status: response.status,
    ok: response.ok,
  };
};

export const useServices = (config?: AgentConfig): Service[] => {
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
