import DoneOutlineIcon from "@mui/icons-material/DoneOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AgentConfig, createAgentConfig, deleteAgentConfig } from "../data/queries/agent-config";
import {
  ContainerInfo,
  ContainerState,
  removeAkitaContainer,
  useContainers,
} from "../data/queries/container";
import { useAkitaAgent } from "../hooks/use-akita-agent";
import { useContainerState } from "../hooks/use-container-state";
import { useDockerDesktopClient } from "../hooks/use-docker-desktop-client";

interface HeaderProps {
  onSettingsClick: () => void;
}

const Header = ({ onSettingsClick }: HeaderProps) => {
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
          <IconButton onClick={onSettingsClick}>
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

interface SettingsDialogProps {
  config?: AgentConfig;
  isOpen: boolean;
  onConfigChange: (config: AgentConfig) => void;
  onCloseDialog: () => void;
}

const SettingsDialog = ({ isOpen, onConfigChange, onCloseDialog, config }: SettingsDialogProps) => {
  const containers = useContainers();

  console.log("SettingsDialog config", config);

  const [input, setInput] = useState<{ project: string; port?: number; container?: string }>({
    project: config?.project_name,
    port: config?.target_port,
    container: config?.target_container,
  });

  const [isUpdatedConfigValid, setIsUpdatedConfigValid] = useState(false);

  useEffect(() => {
    if (!config) {
      setIsUpdatedConfigValid(false);
      return;
    }

    if (
      config?.target_container === input.container &&
      config?.target_port === input.port &&
      config?.project_name === input.project
    ) {
      setIsUpdatedConfigValid(false);
      return;
    }

    if (input.container === "") {
      setIsUpdatedConfigValid(false);
      return;
    }

    if (!input.port && !input.container) {
      setIsUpdatedConfigValid(false);
      return;
    }

    setIsUpdatedConfigValid(true);
  }, [config, input]);

  useEffect(() => {
    if (!config) return;

    setInput({
      project: config?.project_name,
      port: config?.target_port,
      container: config?.target_container,
    });
  }, [config]);

  const handleRestart = () => {
    const newConfig: AgentConfig = {
      api_key: config.api_key,
      api_secret: config.api_secret,
      project_name: input.project,
      target_port: input.port,
      target_container: input.container,
    };

    onConfigChange(newConfig);
    onCloseDialog();
  };

  return (
    <Container maxWidth={"lg"}>
      <Dialog open={isOpen} fullWidth={true}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <Stack justifyContent={"center"} alignItems={"center"} spacing={3}>
            <TextField
              label={"Project Name"}
              value={input.project}
              name={"project"}
              margin={"normal"}
              variant={"standard"}
              fullWidth
              type={"text"}
              onChange={(e) =>
                setInput((prev) => ({ ...prev, project: e.target.value.toString() }))
              }
            />
            <TextField
              label={"Target Port"}
              name={"port"}
              value={input.port}
              variant={"standard"}
              fullWidth
              margin={"normal"}
              type={"number"}
              onChange={(e) => setInput((prev) => ({ ...prev, port: parseInt(e.target.value) }))}
            />
            <TextField
              label={"Target Container"}
              name={"container"}
              margin={"normal"}
              variant={"standard"}
              fullWidth
              type={"text"}
              value={input.container}
              select
              onChange={(e) => setInput((prev) => ({ ...prev, container: e.target.value }))}
            >
              {containers.map((container) => (
                <MenuItem key={container.Id} value={container.Id}>
                  {container.Names[0].replace(/^\//g, "")}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant={"outlined"} onClick={onCloseDialog}>
            Cancel
          </Button>
          <Button
            variant={"contained"}
            color={"primary"}
            disabled={!isUpdatedConfigValid}
            onClick={handleRestart}
          >
            Apply & Restart
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

interface AgentStatusProps {
  containerInfo?: ContainerInfo;
  onReinitialize: () => void;
}

const AgentStatus = ({ containerInfo, onReinitialize }: AgentStatusProps) => {
  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const ddClient = useDockerDesktopClient();
  const containerState = useContainerState(2000, containerInfo?.Id);
  const [status, setStatus] = useState<"Loading" | "Running" | "Starting">("Loading");

  useEffect(() => {
    if (!containerInfo || !containerState) {
      setStatus("Loading");
      return;
    }

    if (containerState === ContainerState.RUNNING) {
      setStatus("Running");
    } else {
      // If the container doesn't exist, we need to restart it.
      onReinitialize();
      setStatus("Starting");
    }
  }, [containerInfo, containerState, onReinitialize]);

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
        color={status === "Running" ? "success" : "warning"}
        label={status}
      />
      <Box alignContent={"center"} display={"flex"} alignItems={"center"} mx={1}>
        {status === "Running" ? <DoneOutlineIcon /> : <CircularProgress size={"1rem"} />}
      </Box>
      {status === "Running" ? (
        <Typography variant={"body1"}>
          Akita is running. Check the{" "}
          <Link onClick={() => ddClient.host.openExternal("https://app.akita.software")}>
            Akita Dashboard
          </Link>{" "}
          to view your models.
        </Typography>
      ) : status === "Starting" ? (
        <Typography variant={"body1"}>Akita is starting...</Typography>
      ) : (
        <Typography variant={"body1"}>Fetching Akita Agent status...</Typography>
      )}
    </Paper>
  );
};

export const AgentPage = () => {
  const ddClient = useDockerDesktopClient();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { config, containerInfo, setIsInitialized } = useAkitaAgent();
  const navigate = useNavigate();

  console.log("AgentPage config", config);

  const handleConfigChange = (config: AgentConfig) => {
    console.log("Config changed", config);
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
