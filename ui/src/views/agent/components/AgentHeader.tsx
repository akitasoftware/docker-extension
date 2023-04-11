import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Button, IconButton, Stack, Tooltip } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AgentConfig, createAgentConfig } from "../../../data/queries/agent-config";
import { removeAkitaContainer } from "../../../data/queries/container";
import { useDockerDesktopClient } from "../../../hooks/use-docker-desktop-client";
import { BaseHeader } from "../../shared/components/BaseHeader";

interface HeaderProps {
  onSettingsClick: () => void;
  onDemoModeClick: () => void;
  agentConfig: AgentConfig;
  onSendAnalyticsEvent: (eventName: string, properties?: Record<string, any>) => void;
}

export const AgentHeader = ({
  onSettingsClick,
  agentConfig,
  onDemoModeClick,
  onSendAnalyticsEvent,
}: HeaderProps) => {
  const navigate = useNavigate();
  const ddClient = useDockerDesktopClient();
  const [isSettingsDisabled, setIsSettingsDisabled] = useState(false);

  useEffect(() => {
    // If the agent is in demo mode, or the configurations is undefined, the settings should not be modifiable.
    setIsSettingsDisabled(agentConfig?.demo_mode_enabled ?? true);
  }, [agentConfig]);

  const onStopClicked = () => {
    onSendAnalyticsEvent("Stopped Agent");
    createAgentConfig(ddClient, { ...agentConfig, enabled: false })
      .then(() => removeAkitaContainer(ddClient))
      .then(() => navigate("/"))
      .catch((e) => {
        ddClient.desktopUI.toast.error(`Failed to stop Akita container: ${e.message}`);
        navigate("/config");
      });
  };

  return (
    <BaseHeader>
      <Stack direction={"row"} spacing={2} alignItems={"center"}>
        <Box>
          <Tooltip title={"Settings"}>
            <IconButton disabled={isSettingsDisabled} onClick={onSettingsClick}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box>
          <Button variant={"outlined"} disabled={!agentConfig} onClick={onDemoModeClick}>
            {agentConfig?.demo_mode_enabled ? "Disable Demo Mode" : "Enable Demo Mode"}
          </Button>
        </Box>
        <Box m={2}>
          <Button variant={"outlined"} color={"error"} onClick={onStopClicked}>
            Stop Akita
          </Button>
        </Box>
      </Stack>
    </BaseHeader>
  );
};
