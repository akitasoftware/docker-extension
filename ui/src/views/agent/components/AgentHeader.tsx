import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AgentConfig,
  createAgentConfig,
} from "../../../data/queries/agent-config";
import { removeAkitaContainer } from "../../../data/queries/container";
import { useDockerDesktopClient } from "../../../hooks/use-docker-desktop-client";
import { BaseHeader } from "../../shared/components/BaseHeader";

interface HeaderProps {
  onSettingsClick: () => void;
  agentConfig: AgentConfig;
  onSendAnalyticsEvent: (
    eventName: string,
    properties?: Record<string, any>
  ) => void;
}

export const AgentHeader = ({
  onSettingsClick,
  agentConfig,
  onSendAnalyticsEvent,
}: HeaderProps) => {
  const navigate = useNavigate();
  const ddClient = useDockerDesktopClient();

  const onStopClicked = () => {
    onSendAnalyticsEvent("Stopped Agent");
    createAgentConfig(ddClient, { ...agentConfig, enabled: false })
      .then(() => removeAkitaContainer(ddClient))
      .then(() => navigate("/"))
      .catch((e) => {
        ddClient.desktopUI.toast.error(
          `Failed to stop Akita container: ${e.message}`
        );
        navigate("/config");
      });
  };

  return (
    <BaseHeader>
      <Box display={"flex"} alignItems={"center"}>
        <Box>
          <Tooltip title={"Settings"}>
            <IconButton onClick={onSettingsClick}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box m={2}>
          <Button variant={"outlined"} color={"error"} onClick={onStopClicked}>
            Stop Akita
          </Button>
        </Box>
      </Box>
    </BaseHeader>
  );
};
