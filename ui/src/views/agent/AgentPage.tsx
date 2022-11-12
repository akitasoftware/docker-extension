import { Stack } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AgentConfig, createAgentConfig, deleteAgentConfig } from "../../data/queries/agent-config";
import { removeAkitaContainer } from "../../data/queries/container";
import { postAnalyticsEvent } from "../../data/queries/event";
import { useAkitaAgent } from "../../hooks/use-akita-agent";
import { useAkitaUser } from "../../hooks/use-akita-user";
import { useDockerDesktopClient } from "../../hooks/use-docker-desktop-client";
import { AgentStatus } from "./components/AgentStatus";
import { Header } from "./components/Header";
import { SettingsDialog } from "./components/SettingsDialog";

export const AgentPage = () => {
  const ddClient = useDockerDesktopClient();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const { config, containerInfo, restartAgent, isInitialized, hasInitializationFailed } =
    useAkitaAgent();
  const navigate = useNavigate();
  const wasWarned = useRef(false);
  const wasViewEventSent = useRef(false);
  const { user, isUnauthorized } = useAkitaUser();

  useEffect(() => {
    if (isUnauthorized) {
      deleteAgentConfig(ddClient)
        .then(() => removeAkitaContainer(ddClient))
        .then(() =>
          ddClient.desktopUI.toast.error("Akita API key is invalid. Please re-authenticate.")
        )
        .then(() => navigate("/"))
        .catch((err) => console.error(err));
    }
  }, [ddClient, isUnauthorized, navigate]);

  useEffect(() => {
    if (!user || wasViewEventSent.current) return;

    postAnalyticsEvent(ddClient, {
      distinct_id: user.email,
      name: "Viewed Agent Page",
      properties: {},
    })
      .then(() => (wasViewEventSent.current = true))
      .catch((err) => console.error(err));
  }, [ddClient, user]);

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

  const handleConfigChange = (config: AgentConfig) => {
    createAgentConfig(ddClient, config)
      .then(() => removeAkitaContainer(ddClient))
      .then(() => navigate("/"))
      .catch((e) => ddClient.desktopUI.toast.error(`Failed to update config: ${e.message}`));
  };

  return (
    <>
      <Stack spacing={4} marginX={8}>
        <Header onSettingsClick={() => setIsSettingsOpen(true)} agentConfig={config} />
        <AgentStatus
          containerInfo={containerInfo}
          onRestartAgent={restartAgent}
          onStopAgent={handleStopAgent}
          isInitialized={isInitialized}
          hasInitializationFailed={hasInitializationFailed}
        />
      </Stack>
      <SettingsDialog
        config={config}
        isOpen={isSettingsOpen && containerInfo !== undefined}
        onConfigChange={handleConfigChange}
        onCloseDialog={() => setIsSettingsOpen(false)}
        user={user}
      />
    </>
  );
};
