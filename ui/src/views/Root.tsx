import React from "react";
import { useNavigate } from "react-router-dom";
import { getAgentConfig } from "../data/queries/agent-config";
import { useDockerDesktopClient } from "../hooks/use-docker-desktop-client";
import {removeAkitaAgentContainer} from "../data/queries/container";

export const Root = () => {
  const ddClient = useDockerDesktopClient();
  const navigate = useNavigate();

  getAgentConfig(ddClient)
    .then(() => {
      navigate("/agent");
    })
    .catch(() => {
      try {
        void removeAkitaAgentContainer(ddClient);
      } catch (e) {
        console.error(e);
      }
      navigate("/config");
    });

  return <>Loading...</>;
};
