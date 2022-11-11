import { Stack } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AgentConfig, createAgentConfig } from "../../data/queries/agent-config";
import { removeAkitaContainer } from "../../data/queries/container";
import { useAkitaAgent } from "../../hooks/use-akita-agent";
import { useDockerDesktopClient } from "../../hooks/use-docker-desktop-client";
import { AgentStatus } from "./components/AgentStatus";
import { Header } from "./components/Header";
import { SettingsDialog } from "./components/SettingsDialog";

export const AgentPage = () => {
  const ddClient = useDockerDesktopClient();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { config, containerInfo, restartAgent, isInitialized } = useAkitaAgent();
  const navigate = useNavigate();
  const wasWarned = useRef(false);

  useEffect(() => {
    if (!config) {
      return;
    }

    if (!config.target_port && !config.target_container && !wasWarned.current) {
      ddClient.desktopUI.toast.warning(
        "No target port or container specified. All traffic will be forwarded to the Akita Agent. Click the gear icon to configure."
      );
      wasWarned.current = true;
    }
  }, [config, ddClient]);

  const handleConfigChange = (config: AgentConfig) => {
    createAgentConfig(ddClient, config)
      .then(() => removeAkitaContainer(ddClient))
      .then(() => navigate("/"))
      .catch((e) => ddClient.desktopUI.toast.error(`Failed to update config: ${e.message}`));
  };

  return (
    <>
      <Stack spacing={4} marginX={8}>
        <Header onSettingsClick={() => setIsSettingsOpen(true)} />
        <AgentStatus
          containerInfo={containerInfo}
          onReinitialize={() => restartAgent()}
          isInitialized={isInitialized}
        />
      </Stack>
      <SettingsDialog
        config={config}
        isOpen={isSettingsOpen && containerInfo !== undefined}
        onConfigChange={handleConfigChange}
        onCloseDialog={() => setIsSettingsOpen(false)}
      />
    </>
  );
};
