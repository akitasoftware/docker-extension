import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Link,
  MenuItem,
  Stack,
  TextField,
  useMediaQuery,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import darkAkitaLogo from "../../assets/img/akita_logo_dark.svg";
import lightAkitaLogo from "../../assets/img/akita_logo_light.svg";
import { AgentConfig, createAgentConfig } from "../../data/queries/agent-config";
import { useContainers } from "../../data/queries/container";
import { getServices } from "../../data/queries/service";
import { useAgentConfig } from "../../hooks/use-agent-config";
import { useDockerDesktopClient } from "../../hooks/use-docker-desktop-client";
import { FeedBackFAB } from "../shared/components/FeedBackFAB";
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
  const containers = useContainers((container) => container.State === "running");
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

  const isSubmitEnabled = () =>
    isConfigInputStateValid(configInput) &&
    !isInvalidAPICredentials &&
    !isInvalidProjectName &&
    !isSubmitWarningDialogOpen;

  return (
    <>
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Container maxWidth={"xs"}>
          <Card elevation={2}>
            <CardMedia
              component={AkitaLogo}
              sx={{
                padding: 4,
              }}
            />
            <CardContent>
              <Stack spacing={2}>
                <Alert severity="info">
                  <AlertTitle>{"We're in beta!"}</AlertTitle>
                  {"If you're not in our beta program"},{" "}
                  <Link
                    onClick={handleSignupClick}
                    sx={{
                      cursor: "pointer",
                    }}
                  >
                    sign up here
                  </Link>
                </Alert>
                <TextField
                  error={isInvalidAPICredentials}
                  required
                  label={"API Key"}
                  name={"apiKey"}
                  type={"text"}
                  margin={"normal"}
                  value={configInput.apiKey}
                  onChange={handleInputChange}
                />
                <TextField
                  error={isInvalidAPICredentials}
                  required
                  label={"API Secret"}
                  name={"apiSecret"}
                  type={"password"}
                  margin={"normal"}
                  value={configInput.apiSecret}
                  onChange={handleInputChange}
                />
                <TextField
                  error={isInvalidProjectName}
                  helperText={isInvalidProjectName ? "Project does not exist" : ""}
                  required
                  label={"Project"}
                  name={"projectName"}
                  type={"text"}
                  margin={"normal"}
                  value={configInput.projectName}
                  onChange={handleInputChange}
                />
                <TextField
                  label={"Target Port"}
                  name={"targetPort"}
                  type={"number"}
                  margin={"normal"}
                  value={configInput.targetPort}
                  onChange={handleInputChange}
                />
                <TextField
                  label={"Target Container"}
                  name={"targetContainer"}
                  type={"text"}
                  margin={"normal"}
                  select
                  value={configInput.targetContainer}
                  onChange={handleInputChange}
                >
                  <MenuItem key={"none"} value={""}>
                    <em>None</em>
                  </MenuItem>
                  {containers.map((container) => (
                    <MenuItem key={container.Id} value={container.Id}>
                      {container.Names[0].replace(/^\//g, "")}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  disabled={!isSubmitEnabled()}
                  variant="contained"
                  onClick={handleSubmitClick}
                  sx={{ mt: 3, mb: 2 }}
                >
                  Start Akita Agent
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
      <FeedBackFAB sx={{ position: "absolute", bottom: 32, right: 32 }} />
      <SubmitWarningDialog
        isOpen={isSubmitWarningDialogOpen}
        onClose={() => setIsSubmitWarningDialogOpen(false)}
        onConfirm={handleStart}
      />
    </>
  );
};
