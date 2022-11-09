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
import { useDockerDesktopClient } from "../hooks/use-docker-desktop-client";
import {useContainers} from "../data/queries/container";


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
}


export const ConfigPage = () => {
  const ddClient = useDockerDesktopClient();
  const [configInput, setConfigInput] = useState<ConfigInputState>(initialConfigInputState);
  const containers = useContainers();
  const navigate = useNavigate();

  const handleSubmit = () => {
    createAgentConfig(ddClient, {
      api_key: configInput.apiKey,
      api_secret: configInput.apiSecret,
      project_name: configInput.projectName,
      target_port: configInput.targetPort,
      target_container: configInput.targetContainer,
    })
      .then(() => {
        navigate("/agent");
      })
      .catch((err) => console.error(err));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setConfigInput({ ...configInput, [name]: value });
  };

  const isInputValid = () =>
    configInput.apiKey &&
    configInput.apiSecret &&
    configInput.projectName &&
    (configInput.targetPort || configInput.targetContainer);

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
                label={"API Key"}
                name={"apiKey"}
                type={"text"}
                margin={"normal"}
                onChange={handleInputChange}
              />
              <TextField
                label={"API Secret"}
                name={"apiSecret"}
                type={"password"}
                margin={"normal"}
                onChange={handleInputChange}
              />
              <TextField
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
                type="submit"
                disabled={!isInputValid()}
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
