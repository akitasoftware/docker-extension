import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { AgentConfig } from "../../../data/queries/agent-config";
import {
  ContainerInfo,
  ContainerState,
  useContainers,
} from "../../../data/queries/container";
import { Service } from "../../../data/queries/service";

interface SettingsDialogProps {
  config?: AgentConfig;
  isOpen: boolean;
  onConfigChange: (config: AgentConfig) => void;
  onCloseDialog: () => void;
  onSendAnalyticsEvent: (
    eventName: string,
    properties?: Record<string, any>
  ) => void;
  services: Service[];
}

interface InputState {
  projectName: string;
  targetPort: string;
  targetContainer: string;
}

const resolveConfigFromInput = (
  config: AgentConfig,
  inputState: InputState
): AgentConfig => ({
  ...config,
  project_name: inputState.projectName,
  target_port:
    inputState.targetPort != "" ? parseInt(inputState.targetPort) : undefined,
  target_container:
    inputState.targetContainer != "" ? inputState.targetContainer : undefined,
});

const inputStateFromConfig = (config?: AgentConfig): InputState => ({
  projectName: config?.project_name ?? "",
  targetPort: config?.target_port?.toString() ?? "",
  targetContainer: config?.target_container ?? "",
});

const internalContainerNames = new Set([
  "akita-extension-db",
  "akita-extension-backend",
  "akita-docker-extension-agent",
]);

// Removes slashes from the container name provided by the Docker CLI
const fixContainerName = (name: string) => name.replace(/^\//g, "");

export const SettingsDialog = ({
  isOpen,
  onConfigChange,
  onCloseDialog,
  config,
  onSendAnalyticsEvent,
  services,
}: SettingsDialogProps) => {
  const containers = useContainers(
    (container: ContainerInfo) =>
      // Filter out non-running and internal containers
      container.State === ContainerState.RUNNING &&
      container.Names.length > 0 &&
      !container.Names.some((name) =>
        internalContainerNames.has(fixContainerName(name))
      )
  );

  const [input, setInput] = useState<InputState>(inputStateFromConfig(config));

  const [isUpdatedConfigValid, setIsUpdatedConfigValid] = useState(false);

  useEffect(() => {
    setInput(inputStateFromConfig(config));
  }, [config]);

  useEffect(() => {
    if (!config) {
      setIsUpdatedConfigValid(false);
      return;
    }

    const updatedConfig = resolveConfigFromInput(config, input);

    const toJsonString = (agentConfig: AgentConfig) =>
      JSON.stringify(agentConfig, (key, value) => {
        if (value === null) {
          return undefined;
        }

        return value;
      });

    const isConfigChanged =
      toJsonString(config) !== toJsonString(updatedConfig);

    const hasProjectName = updatedConfig.project_name !== "";

    setIsUpdatedConfigValid(isConfigChanged && hasProjectName);
  }, [config, input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleRestart = () => {
    onSendAnalyticsEvent("Agent Restarted");
    const newConfig: AgentConfig = resolveConfigFromInput(config, input);
    onConfigChange(newConfig);
    onCloseDialog();
  };

  const handleCancel = () => {
    onCloseDialog();
    setInput(inputStateFromConfig(config));
  };

  return (
    <Container maxWidth={"lg"}>
      <Dialog open={isOpen} fullWidth={true}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <Stack justifyContent={"center"} alignItems={"center"} spacing={3}>
            <TextField
              required
              InputLabelProps={{ shrink: true }}
              label={"Project"}
              value={input.projectName}
              name={"projectName"}
              margin={"normal"}
              variant={"standard"}
              fullWidth
              type={"text"}
              select
              onChange={handleInputChange}
              helperText={"The Akita project to send traffic data to."}
              FormHelperTextProps={{ sx: { fontSize: "9px" } }}
            >
              {services.map((service) => (
                <MenuItem key={service.name} value={service.name}>
                  {service.name}
                </MenuItem>
              ))}
            </TextField>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <TextField
                label={"Container to monitor"}
                name={"targetContainer"}
                InputLabelProps={{ shrink: true }}
                variant={"standard"}
                fullWidth
                placeholder="All containers"
                type={"text"}
                value={input.targetContainer}
                sx={{ marginRight: 1 }}
                select
                onChange={handleInputChange}
                helperText={"Leave blank to monitor entire network."}
                FormHelperTextProps={{ sx: { fontSize: "9px" } }}
              >
                <MenuItem key={"none"} value={""}>
                  <em>All containers</em>
                </MenuItem>
                {containers.map((container) => (
                  <MenuItem key={container.Id} value={container.Id}>
                    {fixContainerName(container.Names[0])}
                  </MenuItem>
                ))}
              </TextField>
              <Typography variant="h4" sx={{ paddingTop: 2 }}>
                :
              </Typography>
              <TextField
                id="target-port"
                label={"Target port"}
                InputLabelProps={{ shrink: true }}
                name={"targetPort"}
                value={input.targetPort}
                InputProps={{
                  inputProps: { min: 1, max: 65535 },
                }}
                variant={"standard"}
                fullWidth
                type={"number"}
                sx={{ marginLeft: 1 }}
                onChange={handleInputChange}
                helperText={
                  "Number between 1 and 65535. Leave blank to monitor all ports."
                }
                FormHelperTextProps={{ sx: { fontSize: "9px" } }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant={"outlined"} onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant={"contained"}
            color={"primary"}
            disabled={!isUpdatedConfigValid}
            onClick={handleRestart}
          >
            Apply & Restart
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
