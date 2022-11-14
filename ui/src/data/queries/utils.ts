import { encode } from "base-64";

export const AkitaURL = "https://api.akita.software";

export const addAuthHeader = (headers: Headers, apiKey: string, apiSecret: string) => {
  const authToken = encode(`${apiKey}:${apiSecret}`);
  headers.append("Authorization", `Basic ${authToken}`);
};
