import DoneOutlineIcon from "@mui/icons-material/DoneOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Link,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { deleteAgentConfig } from "../data/queries/agent-config";
import { ContainerInfo, removeAkitaContainer } from "../data/queries/container";
import { useAkitaAgent } from "../hooks/use-akita-agent";
import { useDockerDesktopClient } from "../hooks/use-docker-desktop-client";

const Header = () => {
  const navigate = useNavigate();
  const ddClient = useDockerDesktopClient();

  const onStopClicked = () => {
    deleteAgentConfig(ddClient)
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
          <IconButton>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box m={2}>
        <Button variant={"contained"} color={"error"} onClick={onStopClicked}>
          Stop Akita
        </Button>
      </Box>
    </Box>
  );
};

interface AgentStatusProps {
  containerInfo: ContainerInfo;
}

const AgentStatus = ({ containerInfo }: AgentStatusProps) => {
  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const ddClient = useDockerDesktopClient();

  return (
    <Paper
      elevation={3}
      sx={{
        marginTop: 4,
        padding: 2,
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: isDarkMode ? "#333d42" : "#f4f4f6",
      }}
    >
      <Chip
        variant={"filled"}
        color={containerInfo ? "success" : "warning"}
        label={containerInfo ? "Running" : "Starting"}
      />
      <Box alignContent={"center"} display={"flex"} alignItems={"center"} mx={1}>
        {containerInfo ? <DoneOutlineIcon /> : <CircularProgress />}
      </Box>
      {containerInfo ? (
        <Typography variant={"body1"}>
          Akita is running. Check the{" "}
          <Link onClick={() => ddClient.host.openExternal("https://app.akita.software")}>
            Akita Dashboard
          </Link>{" "}
          to view your models.
        </Typography>
      ) : (
        <Typography variant={"body1"}>Akita is starting...</Typography>
      )}
    </Paper>
  );
};

export const AgentPage = () => {
  const { containerInfo } = useAkitaAgent();

  return (
    <Stack spacing={4} marginX={8}>
      <Header />
      <AgentStatus containerInfo={containerInfo} />
    </Stack>
  );
};
