import { useEffect, useState } from "react";
import { User, getAkitaUser } from "../data/queries/user";
import { useAgentConfig } from "./use-agent-config";

export const useAkitaUser = (): { user?: User; isUnauthorized: boolean } => {
  const config = useAgentConfig();
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    if (config) {
      getAkitaUser(config.api_key, config.api_secret)
        .then((response) => {
          if (response.ok) {
            setUser(response.user);
            return;
          }

          if (response.status === 401) {
            setIsUnauthorized(true);
            return;
          }

          return Promise.reject(
            new Error(`Unexpected response: ${response.status}. message: ${response.message}`)
          );
        })
        .catch((e) => console.error(e));
    }
  }, [config]);

  return { user, isUnauthorized };
};
