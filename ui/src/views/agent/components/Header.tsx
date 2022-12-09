import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { AgentConfig, createAgentConfig } from "../../../data/queries/agent-config";
import { removeAkitaContainer } from "../../../data/queries/container";
import { useDockerDesktopClient } from "../../../hooks/use-docker-desktop-client";

interface HeaderProps {
  onSettingsClick: () => void;
  agentConfig: AgentConfig;
  onSendAnalyticsEvent: (eventName: string, properties?: Record<string, any>) => void;
}

export const Header = ({ onSettingsClick, agentConfig, onSendAnalyticsEvent }: HeaderProps) => {
  const navigate = useNavigate();
  const ddClient = useDockerDesktopClient();

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
    <Box sx={{ display: "flex", width: "100%", alignItems: "center" }} my={1}>
      <Box alignContent={"flex-start"} textAlign={"left"} flexGrow={1}>
        <Typography sx={{ fontWeight: "bolder" }} variant={"h5"}>
          Akita
        </Typography>
        <Typography variant={"subtitle1"} color={"InactiveCaptionText"}>
          Drop in Agent for API Monitoring and Observability
        </Typography>
      </Box>
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
  );
};
