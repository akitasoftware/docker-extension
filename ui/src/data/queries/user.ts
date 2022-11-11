import { AkitaURL, addAuthHeader } from "./utils";

export interface User {
  organization_id: string;
  name: string;
  id: string;
  email: string;
  created_at: Date;
}

export interface UserResponse {
  user?: User;
  status: number;
  message?: string;
  ok: boolean;
}

export const getAkitaUser = async (apiKey: string, apiSecret: string): Promise<UserResponse> => {
  const headers = new Headers();
  addAuthHeader(headers, apiKey, apiSecret);

  const response = await fetch(`${AkitaURL}/v1/user`, { headers });
  const body = await response.json();

  return {
    user: response.ok ? (body as User) : undefined,
    message: body.message,
    status: response.status,
    ok: response.ok,
  };
};
