import { useCallback, useEffect, useState } from "react";
import { postAnalyticsEvent } from "../data/queries/event";
import { User, getAkitaUser } from "../data/queries/user";
import { useAgentConfig } from "./use-agent-config";
import { useDockerDesktopClient } from "./use-docker-desktop-client";

export const useAkitaUser: () => {
  sendAnalyticsEvent: (eventName: string, properties?: Record<string, any>) => void;
  user: User;
  isUnauthorized: boolean;
} = () => {
  const config = useAgentConfig();
  const ddClient = useDockerDesktopClient();
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

  const sendAnalyticsEvent = useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      if (!user) return;

      postAnalyticsEvent(ddClient, {
        distinct_id: user.email,
        name: eventName,
        properties: properties || {},
      }).catch((e) => console.error(e));
    },
    [ddClient, user]
  );

  return { user, isUnauthorized, sendAnalyticsEvent };
};
