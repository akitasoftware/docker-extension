import { Stack } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AgentConfig, createAgentConfig, deleteAgentConfig } from "../../data/queries/agent-config";
import { removeAkitaContainer } from "../../data/queries/container";
import { useAkitaAgent } from "../../hooks/use-akita-agent";
import { useAkitaServices } from "../../hooks/use-akita-services";
import { useAkitaUser } from "../../hooks/use-akita-user";
import { useDockerDesktopClient } from "../../hooks/use-docker-desktop-client";
import { HelpSpeedDial } from "../shared/components/HelpSpeedDial";
import { AgentHeader } from "./components/AgentHeader";
import { AgentStatus } from "./components/AgentStatus";
import { SettingsDialog } from "./components/SettingsDialog";

export const AgentPage = () => {
  const ddClient = useDockerDesktopClient();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const { config, containerInfo, restartAgent, isInitialized, hasInitializationFailed } =
    useAkitaAgent();
  const services = useAkitaServices(30000, config);
  const navigate = useNavigate();
  const wasWarned = useRef(false);
  const wasViewEventSent = useRef(false);
  const { user, isUnauthorized, sendAnalyticsEvent } = useAkitaUser();

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

    sendAnalyticsEvent("Viewed Agent Page");
    wasViewEventSent.current = true;
  }, [ddClient, sendAnalyticsEvent, user]);

  useEffect(() => {
    if (!config) {
      return;
    }

    if (
      !config.demo_mode_enabled &&
      !config.target_port &&
      !config.target_container &&
      !wasWarned.current
    ) {
      ddClient.desktopUI.toast.warning(
        "No filters specified. All traffic will be forwarded to the Akita Agent. Click the gear icon to configure."
      );
      wasWarned.current = true;
    }
  }, [config, ddClient]);

  const handleFailure = (err: any) => {
    sendAnalyticsEvent("Agent Failed to Start", { errorMessage: err?.message });
    createAgentConfig(ddClient, { ...config, enabled: false })
      .then(() => removeAkitaContainer(ddClient))
      .then(() => ddClient.desktopUI.toast.error("Failed to start Akita Agent."))
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
      .then(() => restartAgent())
      .then(() => navigate("/"))
      .catch(handleFailure);
  };

  const handleDemoModeClick = () => {
    sendAnalyticsEvent("Toggled Demo Mode", { enabled: !config.demo_mode_enabled });
    // Toggle demo mode on or off and remove any targeted port or container
    handleConfigChange({
      ...config,
      demo_mode_enabled: !config.demo_mode_enabled, // toggle demo mode on/off
      target_port: undefined,
      target_container: undefined,
    });
  };

  return (
    <>
      <Stack spacing={4}>
        <AgentHeader
          onDemoModeClick={handleDemoModeClick}
          onSettingsClick={() => setIsSettingsOpen(true)}
          agentConfig={config}
          onSendAnalyticsEvent={sendAnalyticsEvent}
        />
        <AgentStatus
          targetedProjectName={config?.project_name}
          services={services}
          containerInfo={containerInfo}
          onRestartAgent={restartAgent}
          onFailure={handleFailure}
          onSettingsClick={() => config?.demo_mode_enabled && setIsSettingsOpen(true)}
          isInitialized={isInitialized}
          hasInitializationFailed={hasInitializationFailed}
          onSendAnalyticsEvent={sendAnalyticsEvent}
        />
      </Stack>
      <SettingsDialog
        config={config}
        services={services}
        isOpen={isSettingsOpen && containerInfo !== undefined}
        onConfigChange={handleConfigChange}
        onCloseDialog={() => setIsSettingsOpen(false)}
        onSendAnalyticsEvent={sendAnalyticsEvent}
      />
      <HelpSpeedDial sx={{ position: "absolute", bottom: 32, right: 32 }} />
    </>
  );
};
