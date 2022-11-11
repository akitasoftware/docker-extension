import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { AgentConfig } from "../../../data/queries/agent-config";
import { useContainers } from "../../../data/queries/container";

interface SettingsDialogProps {
  config?: AgentConfig;
  isOpen: boolean;
  onConfigChange: (config: AgentConfig) => void;
  onCloseDialog: () => void;
}

interface InputState {
  projectName: string;
  targetPort: string;
  targetContainer: string;
}

const resolveConfigFromInput = (config: AgentConfig, inputState: InputState): AgentConfig => ({
  ...config,
  project_name: inputState.projectName,
  target_port: inputState.targetPort != "" ? parseInt(inputState.targetPort) : undefined,
  target_container: inputState.targetContainer != "" ? inputState.targetContainer : undefined,
});

const inputStateFromConfig = (config?: AgentConfig): InputState => ({
  projectName: config?.project_name ?? "",
  targetPort: config?.target_port?.toString() ?? "",
  targetContainer: config?.target_container ?? "",
});

export const SettingsDialog = ({
  isOpen,
  onConfigChange,
  onCloseDialog,
  config,
}: SettingsDialogProps) => {
  const containers = useContainers();

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

    const isConfigChanged = toJsonString(config) !== toJsonString(updatedConfig);

    const hasProjectName = updatedConfig.project_name !== "";

    setIsUpdatedConfigValid(isConfigChanged && hasProjectName);
  }, [config, input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleRestart = () => {
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
              label={"Project Name"}
              value={input.projectName}
              name={"projectName"}
              margin={"normal"}
              variant={"standard"}
              fullWidth
              type={"text"}
              onChange={handleInputChange}
            />
            <TextField
              label={"Target Port"}
              name={"targetPort"}
              value={input.targetPort}
              variant={"standard"}
              fullWidth
              margin={"normal"}
              type={"number"}
              onChange={handleInputChange}
            />
            <TextField
              label={"Target Container"}
              name={"targetContainer"}
              margin={"normal"}
              variant={"standard"}
              fullWidth
              type={"text"}
              value={input.targetContainer}
              select
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
