import { Typography } from "@mui/material";
import React from "react";
import { useAkitaAgent } from "./hooks/use-akita-agent";
import { useDockerDesktopClient } from "./hooks/use-docker-desktop-client";

export function App() {
  const ddClient = useDockerDesktopClient();

  //TODO (versilis): Remove this once we have a real UI
  const akitaAgentState: string | undefined = useAkitaAgent(
    ddClient,
    "apk_1RumH0Dwhvsg0UBbfqW62i",
    "",
    "docker-extension-testing",
    "50443"
  );

  if (!akitaAgentState) {
    return <Typography variant={"h1"}>Loading...</Typography>;
  }

  return <Typography variant={"h1"}>Akita Agent State: {akitaAgentState}</Typography>;
}
