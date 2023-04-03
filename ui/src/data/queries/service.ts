import { AkitaURL, addAuthHeader } from "./utils";

export interface Service {
  id: string;
  name: string;
  deployment_infos: DeploymentInfo[];
}

export type DeploymentInfo = {
  first_observed: string; // "2022-03-15T00:26:00Z";
  last_observed: string; // "2022-03-15T00:52:00Z";
  name: string;
};

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
