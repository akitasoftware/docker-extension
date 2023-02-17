import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Link,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import darkAkitaLogo from "../../assets/img/akita_logo_dark.svg";
import lightAkitaLogo from "../../assets/img/akita_logo_light.svg";
import { AgentConfig, createAgentConfig } from "../../data/queries/agent-config";
import { getServices } from "../../data/queries/service";
import { useAgentConfig } from "../../hooks/use-agent-config";
import { useDockerDesktopClient } from "../../hooks/use-docker-desktop-client";
import { BaseHeader } from "../shared/components/BaseHeader";
import { HelpSpeedDial } from "../shared/components/HelpSpeedDial";
import { SubmitWarningDialog } from "./components/SubmitWarningDialog";

const AkitaLogo = () => {
  const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  return (
    <img
      src={isDarkMode ? lightAkitaLogo : darkAkitaLogo}
      alt={"Akita"}
      style={{
        height: 140,
        width: "50%",
        display: "block",
        margin: "auto",
      }}
    />
  );
};

interface ConfigInputState {
  apiKey: string;
  apiSecret: string;
  projectName: string;
  targetPort: string;
  targetContainer: string;
}

const initialConfigInputState: ConfigInputState = {
  apiKey: "",
  apiSecret: "",
  projectName: "",
  targetPort: "",
  targetContainer: "",
};

const isConfigInputStateValid = (state: ConfigInputState) =>
  state.apiKey !== "" && state.apiSecret !== "" && state.projectName !== "";

const mapInputToAgentConfig = (input: ConfigInputState): AgentConfig => ({
  api_key: input.apiKey,
  api_secret: input.apiSecret,
  project_name: input.projectName,
  target_port: input.targetPort !== "" ? parseInt(input.targetPort) : undefined,
  target_container: input.targetContainer !== "" ? input.targetContainer : undefined,
  enabled: true,
});

export const ConfigPage = () => {
  const ddClient = useDockerDesktopClient();
  const agentConfig = useAgentConfig();
  const [configInput, setConfigInput] = useState<ConfigInputState>(initialConfigInputState);
  const navigate = useNavigate();
  const [isInvalidAPICredentials, setIsInvalidAPICredentials] = useState(false);
  const [isInvalidProjectName, setIsInvalidProjectName] = useState(false);
  const [isSubmitWarningDialogOpen, setIsSubmitWarningDialogOpen] = useState(false);

  // If the agent config has already been set, pre-populate the form with the existing values.
  useEffect(() => {
    if (agentConfig) {
      setConfigInput({
        apiKey: agentConfig.api_key.toString(),
        apiSecret: agentConfig.api_secret.toString(),
        projectName: agentConfig.project_name.toString(),
        targetPort: agentConfig.target_port?.toString() ?? "",
        targetContainer: agentConfig.target_container?.toString() ?? "",
      });
    }
  }, [agentConfig]);

  // TODO: Validation doesn't work in dev mode because of CORS. We should probably add an env var to account for this.
  // As a hacky workaround, you can comment out any checks in this function and just return true.
  const validateSubmission = async () => {
    const serviceResponse = await getServices(configInput.apiKey, configInput.apiSecret).catch(
      (err) => {
        ddClient.desktopUI.toast.error(`Failed to fetch Akita projects: ${err.message}`);
        return undefined;
      }
    );

    if (!serviceResponse) return false;

    if (serviceResponse.status === 401) {
      setIsInvalidAPICredentials(true);
      ddClient.desktopUI.toast.error("Invalid API credentials");
      return false;
    }

    if (!serviceResponse.ok) {
      ddClient.desktopUI.toast.error(`Failed to fetch Akita projects: ${serviceResponse.status}`);
      return false;
    }

    if (!serviceResponse.services.some((service) => service.name === configInput.projectName)) {
      setIsInvalidProjectName(true);
      ddClient.desktopUI.toast.error(`Project ${configInput.projectName} does not exist`);
      return false;
    }

    return true;
  };

  const handleSubmitClick = () => {
    validateSubmission()
      .then((isValid) => {
        if (isValid) {
          return createAgentConfig(ddClient, mapInputToAgentConfig(configInput));
        } else {
          return Promise.reject(new Error("Invalid submission"));
        }
      })
      .then(() => setIsSubmitWarningDialogOpen(true))
      .catch((e) => {
        if (e.message !== "Invalid submission") {
          ddClient.desktopUI.toast.error(`Submission failed: ${e.message}`);
        }
      });
  };

  const handleStart = () => {
    navigate("/");
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === "apiKey" || event.target.name === "apiSecret") {
      setIsInvalidAPICredentials(false);
    }
    if (event.target.name === "projectName") {
      setIsInvalidProjectName(false);
    }
    const { name, value } = event.target;
    setConfigInput({ ...configInput, [name]: value });
  };

  const handleSignupClick = () => {
    ddClient.host.openExternal(
      "https://www.akitasoftware.com/beta-signup?utm_source=docker&utm_medium=link&utm_campaign=beta_from_docker"
    );
  };

  const isSubmitEnabled =
    isConfigInputStateValid(configInput) &&
    !isInvalidAPICredentials &&
    !isInvalidProjectName &&
    !isSubmitWarningDialogOpen;

  return (
    <>
      <Box display="flex" flexDirection="column">
        <BaseHeader />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          marginTop={8}
          flexDirection="column"
        >
          <Container maxWidth={"xs"}>
            <Card elevation={2}>
              <CardMedia component={AkitaLogo} />
              <CardContent>
                <Stack spacing={4} marginX={1}>
                  <TextField
                    error={isInvalidAPICredentials}
                    required
                    placeholder="API Key"
                    label={"API Key"}
                    name={"apiKey"}
                    type={"text"}
                    variant={"outlined"}
                    value={configInput.apiKey}
                    onChange={handleInputChange}
                  />
                  <TextField
                    error={isInvalidAPICredentials}
                    required
                    placeholder={"API Secret"}
                    label={"API Secret"}
                    name={"apiSecret"}
                    type={"password"}
                    variant={"outlined"}
                    value={configInput.apiSecret}
                    onChange={handleInputChange}
                  />
                  <TextField
                    error={isInvalidProjectName}
                    helperText={isInvalidProjectName ? "Project does not exist" : ""}
                    required
                    label={"Project"}
                    placeholder={"Project"}
                    name={"projectName"}
                    type={"text"}
                    variant={"outlined"}
                    value={configInput.projectName}
                    onChange={handleInputChange}
                  />
                  <Button
                    disabled={!isSubmitEnabled}
                    variant="contained"
                    onClick={handleSubmitClick}
                    size={"large"}
                  >
                    Start Akita Agent
                  </Button>
                </Stack>
              </CardContent>{" "}
              <Typography marginY={2} variant="body1" color="text.secondary" align="center">
                No account?{" "}
                <Link
                  onClick={handleSignupClick}
                  sx={{
                    cursor: "pointer",
                  }}
                >
                  Join the beta to get access
                </Link>
              </Typography>
            </Card>
          </Container>
        </Box>
      </Box>
      <HelpSpeedDial sx={{ position: "absolute", bottom: 32, right: 32 }} />
      <SubmitWarningDialog
        isOpen={isSubmitWarningDialogOpen}
        onClose={() => setIsSubmitWarningDialogOpen(false)}
        onConfirm={handleStart}
      />
    </>
  );
};
