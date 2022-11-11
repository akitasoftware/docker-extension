import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { AgentConfig, createAgentConfig } from "../../../data/queries/agent-config";
import { removeAkitaContainer } from "../../../data/queries/container";
import { useDockerDesktopClient } from "../../../hooks/use-docker-desktop-client";

interface HeaderProps {
  onSettingsClick: () => void;
  config?: AgentConfig;
}

export const Header = ({ onSettingsClick, config }: HeaderProps) => {
  const navigate = useNavigate();
  const ddClient = useDockerDesktopClient();

  const onStopClicked = () => {
    createAgentConfig(ddClient, { ...config, enabled: false })
      .then(() => removeAkitaContainer(ddClient))
      .then(() => navigate("/"))
      .catch((e) => ddClient.desktopUI.toast.error(`Failed to stop Akita container: ${e.message}`));
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
        <Button variant={"contained"} color={"error"} onClick={onStopClicked} disabled={!config}>
          Stop Akita
        </Button>
      </Box>
    </Box>
  );
};
