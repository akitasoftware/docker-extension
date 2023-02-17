import DoneOutlineIcon from "@mui/icons-material/DoneOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { Box, Button, CircularProgress, Link, Paper, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { ContainerInfo, ContainerState } from "../../../data/queries/container";
import { Service } from "../../../data/queries/service";
import { useContainerState } from "../../../hooks/use-container-state";
import { useDockerDesktopClient } from "../../../hooks/use-docker-desktop-client";

interface AgentStatusProps {
  containerInfo?: ContainerInfo;
  isInitialized: boolean;
  onRestartAgent: () => void;
  onFailure: () => void;
  onSendAnalyticsEvent: (eventName: string, properties?: Record<string, any>) => void;
  hasInitializationFailed: boolean;
  services: Service[];
}

export const AgentStatus = ({
  containerInfo,
  onRestartAgent,
  onFailure,
  isInitialized,
  hasInitializationFailed,
  onSendAnalyticsEvent,
  services,
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

  const resolveAPIModelURL = () => {
    const service = services.find((service) => service.name === "akita-backend");
    // If the service is not found, just send them to the dashboard's overview page
    // It might not send them to the right project, but it's better than nothing ¯\_(ツ)_/¯
    if (!service) {
      return "https://app.akita.software";
    }

    // If the service is found, return the dashboard URL with the project ID
    return `https://app.akita.software/services/${service.id}/deployment/default/model`;
  };

  const handleViewWebDashboard = () => {
    onSendAnalyticsEvent("Opened Akita Web Dashboard");
    ddClient.host.openExternal(resolveAPIModelURL());
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
      <Box alignContent={"center"} display={"flex"} alignItems={"center"} mx={1}>
        {status === "Running" ? (
          <DoneOutlineIcon color={"success"} />
        ) : status === "Failed" ? (
          <ErrorOutlineOutlinedIcon />
        ) : (
          <CircularProgress size={"1rem"} />
        )}
      </Box>
      {status === "Running" ? (
        <Typography variant={"body1"}>
          Akita is running.{" "}
          <Link
            onClick={handleViewContainer}
            sx={{
              cursor: "pointer",
            }}
          >
            Check the Agent container
          </Link>{" "}
          to view logs.
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
        <Button
          variant={"contained"}
          color={"primary"}
          onClick={handleViewWebDashboard}
          disabled={!canViewContainer}
        >
          View API Model
        </Button>
      </Box>
    </Paper>
  );
};
