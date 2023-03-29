import DoneOutlineIcon from "@mui/icons-material/DoneOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import {
  Box,
  Button,
  CircularProgress,
  Link,
  Paper,
  Typography,
} from "@mui/material";
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
  onSendAnalyticsEvent: (
    eventName: string,
    properties?: Record<string, any>
  ) => void;
  hasInitializationFailed: boolean;
  services: Service[];
  targetedProjectName?: string;
}

export const AgentStatus = ({
  containerInfo,
  onRestartAgent,
  onFailure,
  isInitialized,
  hasInitializationFailed,
  onSendAnalyticsEvent,
  services,
  targetedProjectName,
}: AgentStatusProps) => {
  const ddClient = useDockerDesktopClient();
  const containerState = useContainerState(2000, containerInfo?.Id);
  const [status, setStatus] = useState<
    "Loading" | "Running" | "Starting" | "Failed"
  >("Loading");
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

  // If we can't find the service on the backend, this will be undefined.
  const targetProject = services.find(
    (service) => service.name === targetedProjectName
  );
  const fourHoursAgo = new Date(new Date().getTime() - 5 * 60 * 60 * 1000);
  const projectLastSeenRecently =
    !!targetProject &&
    targetProject.deployment_infos.length > 0 &&
    new Date(
      Math.max(
        ...targetProject.deployment_infos.map((d) =>
          new Date(d.last_observed || 0).valueOf()
        )
      )
    ) > fourHoursAgo;

  console.log(services, targetProject, fourHoursAgo, projectLastSeenRecently);

  const resolveAPIModelURL = () => {
    // If the project is not found, just send them to the dashboard's overview page
    // It might not send them to the right project, but it's better than nothing ¯\_(ツ)_/¯
    if (!targetProject) {
      return "https://app.akita.software";
    }

    // If the project is found, return the API Model URL with the project ID
    return `https://app.akita.software/service/${targetProject.id}/deployment/default/model`;
  };

  const handleViewWebDashboard = () => {
    onSendAnalyticsEvent("Opened Akita Web Dashboard");
    ddClient.host.openExternal(resolveAPIModelURL());
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
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
      <Box
        alignContent={"center"}
        display={"flex"}
        alignItems={"center"}
        mx={1}
      >
        {status === "Running" ? (
          projectLastSeenRecently ? (
            <DoneOutlineIcon color={"success"} />
          ) : (
            <MoreHorizOutlinedIcon color={"info"} />
          )
        ) : status === "Failed" ? (
          <ErrorOutlineOutlinedIcon />
        ) : (
          <CircularProgress size={"1rem"} />
        )}
      </Box>
      {status === "Running" ? (
        <Typography variant={"body1"}>
          Akita is running
          {" "}
          {projectLastSeenRecently ? "and your project is receiving traffic" : "but has not yet received any traffic. Please check your extension settings, or contact support@akitasoftware.com if this issue persists"}
          .
          {" "}
          {canViewContainer && !projectLastSeenRecently && (
            <>You may also wish to{" "}
            <Link
              onClick={handleViewContainer}
              sx={{
                cursor: "pointer",
              }}
            >
              view your Agent container logs
            </Link></>
          )}
          {canViewContainer && !projectLastSeenRecently && " to debug this issue."}
        </Typography>
      ) : status === "Starting" ? (
        <Typography variant={"body1"}>Akita is starting...</Typography>
      ) : status === "Failed" ? (
        <Typography variant={"body1"}>
          Failed to start Akita. Update the configuration settings and try again
        </Typography>
      ) : (
        <Typography variant={"body1"}>
          Fetching Akita Agent status...
        </Typography>
      )}
      {projectLastSeenRecently && (<Box
        alignContent={"center"}
        marginLeft={"auto"}
        whiteSpace={"nowrap"}
        textAlign={"center"}
      >
        <Button
          variant={"contained"}
          color={"primary"}
          onClick={handleViewWebDashboard}
        >
          View API Model
        </Button>
      </Box>)}
    </Paper>
  );
};
