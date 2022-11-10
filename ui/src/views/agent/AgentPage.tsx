import { Stack } from "@mui/material";
import React, { useState } from "react";
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
  const { config, containerInfo, setIsInitialized } = useAkitaAgent();
  const navigate = useNavigate();

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
        <AgentStatus containerInfo={containerInfo} onReinitialize={() => setIsInitialized(false)} />
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
