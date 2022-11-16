import { Stack } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAgentConfig } from "../../data/queries/agent-config";
import { removeAkitaContainer } from "../../data/queries/container";
import { useAkitaAgent } from "../../hooks/use-akita-agent";
import { useDockerDesktopClient } from "../../hooks/use-docker-desktop-client";
import { AgentStatus } from "./components/AgentStatus";

export const AgentPage = () => {
  const ddClient = useDockerDesktopClient();
  const { config, containerInfo, restartAgent, isInitialized, hasInitializationFailed } =
    useAkitaAgent();
  const navigate = useNavigate();
  const wasWarned = useRef(false);

  useEffect(() => {
    if (!config) {
      return;
    }

    if (!config.target_port && !config.target_container && !wasWarned.current) {
      ddClient.desktopUI.toast.warning(
        "No filters specified. All traffic will be forwarded to the Akita Agent. Click the gear icon to configure."
      );
      wasWarned.current = true;
    }
  }, [config, ddClient]);

  const handleStopAgent = () => {
    deleteAgentConfig(ddClient)
      .then(() => removeAkitaContainer(ddClient))
      .then(() => ddClient.desktopUI.toast.error("Akita agent failed to start. Please try again."))
      .then(() => navigate("/"))
      .catch(() =>
        ddClient.desktopUI.toast.error(
          "Failed to start agent. Update the agent settings and try again."
        )
      );
  };

  return (
    <>
      <Stack spacing={4} marginX={8}>
        {/* TODO: Add Header */}
        <AgentStatus
          containerInfo={containerInfo}
          onRestartAgent={restartAgent}
          onStopAgent={handleStopAgent}
          isInitialized={isInitialized}
          hasInitializationFailed={hasInitializationFailed}
        />
      </Stack>
      {/* TODO: Add Settings Dialog */}
    </>
  );
};
