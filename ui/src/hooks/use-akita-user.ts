import { useEffect, useState } from "react";
import { User, getAkitaUser } from "../data/queries/user";
import { useAgentConfig } from "./use-agent-config";

export const useAkitaUser = (): { user?: User; hasError: boolean; isUnauthorized: boolean } => {
  const config = useAgentConfig();
  const [user, setUser] = useState<User | undefined>(undefined);
  const [hasError, setHasError] = useState(false);
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
            setHasError(true);
            setIsUnauthorized(true);
            return;
          }

          setHasError(true);
        })
        .catch(() => setHasError(true));
    }
  }, [config]);

  return { user, hasError, isUnauthorized };
};
