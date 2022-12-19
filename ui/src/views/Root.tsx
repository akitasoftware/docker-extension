import React from "react";
import { useNavigate } from "react-router-dom";
import { getAgentConfig } from "../data/queries/agent-config";
import { removeAkitaContainer } from "../data/queries/container";
import { useDockerDesktopClient } from "../hooks/use-docker-desktop-client";

export const Root = () => {
  const ddClient = useDockerDesktopClient();
  const navigate = useNavigate();

  getAgentConfig(ddClient)
    .then((config) => {
      if (config.enabled) {
        navigate("/agent");
      } else {
        removeAkitaContainer(ddClient).finally(() => navigate("/config"));
      }
    })
    .catch((e) => {
      if (e.statusCode !== 404) {
        ddClient.desktopUI.toast.error(`Failed to get agent config: ${e.message}`);
      }

      try {
        void removeAkitaContainer(ddClient);
      } catch (e) {
        ddClient.desktopUI.toast.error(`Failed to remove Akita container: ${e.message}`);
      }
      navigate("/config");
    });

  return <>Loading...</>;
};
