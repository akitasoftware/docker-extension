import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  MenuItem,
  Stack,
  TextField,
  useMediaQuery,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import darkAkitaLogo from "../assets/img/akita_logo_dark.svg";
import lightAkitaLogo from "../assets/img/akita_logo_light.svg";
import { createAgentConfig } from "../data/queries/agent-config";
import { useContainers } from "../data/queries/container";
import { getServices } from "../data/queries/service";
import { UserResponse, getAkitaUser } from "../data/queries/user";
import { useDockerDesktopClient } from "../hooks/use-docker-desktop-client";

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
  apiKey?: string;
  apiSecret?: string;
  projectName?: string;
  targetPort?: number;
  targetContainer?: string;
}

const initialConfigInputState: ConfigInputState = {
  apiKey: undefined,
  apiSecret: undefined,
  projectName: undefined,
  targetPort: undefined,
  targetContainer: undefined,
};

export const ConfigPage = () => {
  const ddClient = useDockerDesktopClient();
  const [configInput, setConfigInput] = useState<ConfigInputState>(initialConfigInputState);
  const containers = useContainers();
  const navigate = useNavigate();
  const [isInvalidAPICredentials, setIsInvalidAPICredentials] = useState(false);
  const [isInvalidProjectName, setIsInvalidProjectName] = useState(false);

  const validateProjectName = async () => {
    const serviceResponse = await getServices(configInput.apiKey, configInput.apiSecret).catch(
      (err) => {
        ddClient.desktopUI.toast.error(`Failed to fetch Akita projects: ${err.message}`);
        return undefined;
      }
    );

    if (!serviceResponse) return false;

    if (serviceResponse.status === 401) {
      // Return false to indicate that the API credentials are invalid, but don't show an error message
      return false;
    }

    if (!serviceResponse.ok) {
      ddClient.desktopUI.toast.error(
        `Failed to fetch Akita projects: ${serviceResponse.statusText}`
      );
      return false;
    }

    if (!serviceResponse.services.some((service) => service.name === configInput.projectName)) {
      setIsInvalidProjectName(true);
      ddClient.desktopUI.toast.error(`Project ${configInput.projectName} does not exist`);
      return false;
    }

    return true;
  };

  const validateAPICredentials = async () => {
    const userResponse: UserResponse = await getAkitaUser(
      configInput.apiKey,
      configInput.apiSecret
    ).catch(() => {
      ddClient.desktopUI.toast.error("Failed to authenticate with Akita API");
      return undefined;
    });

    if (!userResponse) return false;

    if (!userResponse.ok) {
      if (userResponse.status === 401) {
        ddClient.desktopUI.toast.error("Invalid Akita API credentials");
        setIsInvalidAPICredentials(true);
      } else {
        ddClient.desktopUI.toast.error(
          `Failed to authenticate with Akita API: ${userResponse.status}`
        );
      }

      return false;
    }

    return true;
  };

  const validateSubmission = async () => {
    const isProjectNameValid = await validateProjectName();
    const isAPICredentialsValid = await validateAPICredentials();

    return isProjectNameValid && isAPICredentialsValid;
  };

  const handleSubmit = () => {
    validateSubmission()
      .then((isValid) => {
        if (isValid) {
          return createAgentConfig(ddClient, {
            api_key: configInput.apiKey,
            api_secret: configInput.apiSecret,
            project_name: configInput.projectName,
            target_port: configInput.targetPort,
            target_container: configInput.targetContainer,
          });
        }

        return Promise.reject(new Error("Invalid submission"));
      })
      .then(() => navigate("/"))
      .catch((err) => {
        if (err.message === "Invalid submission") {
          return;
        }
        ddClient.desktopUI.toast.error(`Failed to create agent config: ${err.message}`);
      });
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

  const isSubmitEnabled = () =>
    configInput.apiKey &&
    configInput.apiSecret &&
    configInput.projectName &&
    (configInput.targetPort || configInput.targetContainer) &&
    !isInvalidAPICredentials &&
    !isInvalidProjectName;

  return (
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
              <TextField
                error={isInvalidAPICredentials}
                required
                label={"API Key"}
                name={"apiKey"}
                type={"text"}
                margin={"normal"}
                onChange={handleInputChange}
              />
              <TextField
                error={isInvalidAPICredentials}
                required
                label={"API Secret"}
                name={"apiSecret"}
                type={"password"}
                margin={"normal"}
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
                onChange={handleInputChange}
              />
              <TextField
                label={"Target Port"}
                name={"targetPort"}
                type={"number"}
                margin={"normal"}
                onChange={handleInputChange}
              />
              <TextField
                label={"Target Container"}
                name={"targetContainer"}
                type={"text"}
                margin={"normal"}
                select
                onChange={handleInputChange}
              >
                {containers.map((container) => (
                  <MenuItem key={container.Id} value={container.Id}>
                    {container.Names[0].replace(/^\//g, "")}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                disabled={!isSubmitEnabled()}
                variant="contained"
                onClick={handleSubmit}
                sx={{ mt: 3, mb: 2 }}
              >
                Start Akita Agent
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};
