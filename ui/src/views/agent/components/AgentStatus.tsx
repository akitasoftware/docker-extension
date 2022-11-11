import DoneOutlineIcon from "@mui/icons-material/DoneOutlined";
import { Box, Chip, CircularProgress, Link, Paper, Typography, useMediaQuery } from "@mui/material";
import React, { useEffect, useState } from "react";
import { ContainerInfo, ContainerState } from "../../../data/queries/container";
import { useContainerState } from "../../../hooks/use-container-state";
import { useDockerDesktopClient } from "../../../hooks/use-docker-desktop-client";

interface AgentStatusProps {
  containerInfo?: ContainerInfo;
  isInitialized: boolean;
  onReinitialize: () => void;
}

export const AgentStatus = ({ containerInfo, onReinitialize, isInitialized }: AgentStatusProps) => {
  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const ddClient = useDockerDesktopClient();
  const containerState = useContainerState(2000, containerInfo?.Id);
  const [status, setStatus] = useState<"Loading" | "Running" | "Starting">("Loading");

  useEffect(() => {
    if (!isInitialized) {
      setStatus("Starting");
      return;
    }

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
  }, [containerInfo, containerState, isInitialized, onReinitialize]);

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
