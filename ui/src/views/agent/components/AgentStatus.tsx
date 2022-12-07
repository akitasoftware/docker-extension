import DoneOutlineIcon from "@mui/icons-material/DoneOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { Box, Button, Chip, CircularProgress, Link, Paper, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { ContainerInfo, ContainerState } from "../../../data/queries/container";
import { useContainerState } from "../../../hooks/use-container-state";
import { useDockerDesktopClient } from "../../../hooks/use-docker-desktop-client";

interface AgentStatusProps {
  containerInfo?: ContainerInfo;
  isInitialized: boolean;
  onRestartAgent: () => void;
  onFailure: () => void;
  onSendAnalyticsEvent: (eventName: string, properties?: Record<string, any>) => void;
  hasInitializationFailed: boolean;
}

export const AgentStatus = ({
  containerInfo,
  onRestartAgent,
  onFailure,
  isInitialized,
  hasInitializationFailed,
  onSendAnalyticsEvent,
}: AgentStatusProps) => {
  const ddClient = useDockerDesktopClient();
  const containerState = useContainerState(2000, containerInfo?.Id);
  const [status, setStatus] = useState<"Loading" | "Running" | "Starting" | "Failed">("Loading");
  const [canViewContainer, setCanViewContainer] = useState(false);

  useEffect(() => {
    // If the container has failed to start after multiple attempt, set the status to failed.
    if (hasInitializationFailed) {
      setStatus("Failed");
      onFailure();
    }

    // If the container is not initialized, set the status to starting.
    if (!isInitialized) {
      console.log("Container is not initialized");
      setStatus("Starting");
      return;
    }

    // If the container has been initialized, but the container info is not available, set the status to loading
    if (!containerInfo || !containerState) {
      setStatus("Loading");
      return;
    }

    if (containerState === ContainerState.RUNNING) {
      setStatus("Running");
    } else {
      // If the container doesn't exist, we need to restart it.
      onRestartAgent();
      setStatus("Starting");
    }
  }, [
    hasInitializationFailed,
    containerInfo,
    containerState,
    isInitialized,
    onRestartAgent,
    onFailure,
  ]);

  useEffect(() => {
    if (status === "Running") {
      setCanViewContainer(true);
    } else {
      setCanViewContainer(false);
    }
  }, [status]);

  const handleViewContainer = () => {
    ddClient.desktopUI.navigate
      .viewContainer(containerInfo?.Id)
      .catch((err) => console.error("Failed to navigate to container", err));
  };

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
      }}
    >
      <Chip
        variant={"filled"}
        color={status === "Running" ? "success" : status === "Failed" ? "error" : "warning"}
        label={status}
        sx={{ padding: 2, fontSize: "1rem" }}
      />
      <Box alignContent={"center"} display={"flex"} alignItems={"center"} mx={1}>
        {status === "Running" ? (
          <DoneOutlineIcon />
        ) : status === "Failed" ? (
          <ErrorOutlineOutlinedIcon />
        ) : (
          <CircularProgress size={"1rem"} />
        )}
      </Box>
      {status === "Running" ? (
        <Typography variant={"body1"}>
          Akita is running. Check the{" "}
          <Link
            onClick={() => {
              onSendAnalyticsEvent("Opened Akita Web Dashboard");
              ddClient.host.openExternal("https://app.akita.software");
            }}
            sx={{
              cursor: "pointer",
            }}
          >
            Akita Dashboard
          </Link>{" "}
          to view your models.
        </Typography>
      ) : status === "Starting" ? (
        <Typography variant={"body1"}>Akita is starting...</Typography>
      ) : status === "Failed" ? (
        <Typography variant={"body1"}>
          Failed to start Akita. Update the configuration settings and try again
        </Typography>
      ) : (
        <Typography variant={"body1"}>Fetching Akita Agent status...</Typography>
      )}
      <Box alignContent={"center"} marginLeft={"auto"} whiteSpace={"nowrap"} textAlign={"center"}>
        <Button variant={"outlined"} onClick={handleViewContainer} disabled={!canViewContainer}>
          View Container
        </Button>
      </Box>
    </Paper>
  );
};
