import DoneOutlineIcon from "@mui/icons-material/DoneOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import { Box, Button, CircularProgress, Link, Paper, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { AgentConfig } from "../../../data/queries/agent-config";
import { ContainerInfo, ContainerState } from "../../../data/queries/container";
import { Service } from "../../../data/queries/service";
import { useAkitaAgentContainerState } from "../../../hooks/use-akita-agent-container-state";
import { useDockerDesktopClient } from "../../../hooks/use-docker-desktop-client";

interface AgentStatusProps {
  containerInfo?: ContainerInfo;
  agentConfig?: AgentConfig;
  isInitialized: boolean;
  onRestartAgent: () => void;
  onFailure: (err) => void;
  onSettingsClick: () => void;
  onSendAnalyticsEvent: (eventName: string, properties?: Record<string, any>) => void;
  hasInitializationFailed: boolean;
  services: Service[];
  targetedProjectName?: string;
}

export const AgentStatus = ({
  containerInfo,
  agentConfig,
  onRestartAgent,
  onFailure,
  isInitialized,
  hasInitializationFailed,
  onSendAnalyticsEvent,
  onSettingsClick,
  services,
  targetedProjectName,
}: AgentStatusProps) => {
  const ddClient = useDockerDesktopClient();
  const containerState = useAkitaAgentContainerState(2000);
  const [status, setStatus] = useState<"Loading" | "Running" | "Starting" | "Failed">("Loading");
  const [canViewContainer, setCanViewContainer] = useState(false);

  useEffect(() => {
    // If the container has failed to start after multiple attempt, set the status to failed.
    if (hasInitializationFailed) {
      setStatus("Failed");
      onFailure(new Error("hasInitializationFailed was true"));
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
  const targetProject = services.find((service) => service.name === targetedProjectName);
  const fourHoursAgo = new Date(new Date().getTime() - 4 * 60 * 60 * 1000);

  const previouslySeenDeploymentInfos = targetProject
    ? targetProject.deployment_infos.filter((di) => !!di.last_observed)
    : [];
  const projectLastSeenAt =
    previouslySeenDeploymentInfos.length > 0
      ? new Date(
          Math.max(
            ...previouslySeenDeploymentInfos.map((di) => new Date(di.last_observed).valueOf())
          )
        )
      : undefined;
  const isProjectLastSeenRecently = !!projectLastSeenAt && projectLastSeenAt > fourHoursAgo;

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
      <Box mx={1}>
        {status === "Running" ? (
          isProjectLastSeenRecently ? (
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
        <Box>
          <Typography variant={"body1"}>
            Akita is running{" "}
            {isProjectLastSeenRecently ? (
              "and your project is receiving traffic"
            ) : (
              <>
                but has not seen any traffic {projectLastSeenAt ? "recently" : "yet"}.
                {agentConfig &&
                  !agentConfig.demo_mode_enabled &&
                  " Please note that your app must be running within Docker Desktop for Akita to see its traffic. "}
                If this issue persists, check your{" "}
                <Link
                  onClick={onSettingsClick}
                  sx={{
                    cursor: agentConfig && !agentConfig.demo_mode_enabled ? "pointer" : "default",
                  }}
                >
                  extension settings
                </Link>
                , or contact us at{" "}
                <Link
                  href="mailto:support@akitasoftware.com"
                  sx={{
                    cursor: "pointer",
                  }}
                >
                  support@akitasoftware.com
                </Link>{" "}
                for help.{" "}
              </>
            )}
            {canViewContainer && !isProjectLastSeenRecently && (
              <>
                You may also wish to{" "}
                <Link
                  onClick={handleViewContainer}
                  sx={{
                    cursor: "pointer",
                  }}
                >
                  view your Agent container logs
                </Link>
              </>
            )}
            {canViewContainer && !isProjectLastSeenRecently && " to debug this issue."}
          </Typography>
          {!isProjectLastSeenRecently &&
            (projectLastSeenAt ? (
              <Typography sx={{ marginTop: 2 }}>
                You have previously sent traffic to Akita.{" "}
                <Link
                  onClick={handleViewWebDashboard}
                  sx={{
                    cursor: "pointer",
                  }}
                >
                  Click here to view your existing API model.
                </Link>
              </Typography>
            ) : (
              <Typography sx={{ marginTop: 2 }}>
                <Link
                  onClick={handleViewWebDashboard}
                  sx={{
                    cursor: "pointer",
                  }}
                >
                  Click here to view your Akita dashboard.
                </Link>
              </Typography>
            ))}
        </Box>
      ) : status === "Starting" ? (
        <Typography variant={"body1"}>Akita is starting...</Typography>
      ) : status === "Failed" ? (
        <Typography variant={"body1"}>
          Failed to start Akita. Update the configuration settings and try again
        </Typography>
      ) : (
        <Typography variant={"body1"}>Fetching Akita Agent status...</Typography>
      )}
      {isProjectLastSeenRecently && (
        <Box alignContent={"center"} marginLeft={"auto"} whiteSpace={"nowrap"} textAlign={"center"}>
          <Button variant={"contained"} color={"primary"} onClick={handleViewWebDashboard}>
            View API Model
          </Button>
        </Box>
      )}
    </Paper>
  );
};
