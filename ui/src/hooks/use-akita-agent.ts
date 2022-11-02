import { v1 } from "@docker/extension-api-client-types";
import { useEffect, useState } from "react";
import { ContainerState, getAkitaAgentContainer } from "../utils/container";

export const useAkitaAgent = (
  client: v1.DockerDesktopClient,
  akitaAPIKey: string,
  akitaAPISecret: string,
  akitaProjectName: string,
  targetPort: string | undefined = undefined,
  targetContainer: string | undefined = undefined
) => {
  const [state, setState] = useState<string | undefined>(undefined);

  useEffect(() => {
    const interval = setInterval(() => {
      // Checks the current lifecycle state of the Akita agent container.
      // If the container is not running, startAkitaAgent will be called.
      const getCurrentAgentState = async (): Promise<ContainerState | undefined> => {
        const container = await getAkitaAgentContainer(client);
        return container?.State;
      };

      // Starts the Akita agent container.
      const startAkitaAgent = async (): Promise<void> => {
        // Pull the latest image of Akita CLI
        await client.docker.cli.exec("pull", ["public.ecr.aws/akitasoftware/akita-cli:latest"]);

        // Start the Akita agent
        //TODO (versilis): Add a way to log the container's output. Maybe use the `stream` option?
        const networkArg = targetContainer ? `container:${targetContainer}` : "host";
        const runArgs = [
          "--rm",
          `--network ${networkArg}`,
          "--name akita-docker-extension-agent",
          `-e AKITA_API_KEY_ID=${akitaAPIKey}`,
          `-e AKITA_API_KEY_SECRET=${akitaAPISecret}`,
          "akitasoftware/cli:latest apidump",
          `--project ${akitaProjectName}`,
        ];
        if (targetPort) {
          runArgs.push(`--filter "port ${targetPort}"`);
        }

        await client.docker.cli.exec("run", runArgs);
      };

      getCurrentAgentState()
        .then((currState) => {
          if (!currState) {
            return startAkitaAgent();
          }

          setState(currState);
        })
        .catch((err) => {
          setState(err);
        });
    }, 2000);
    return () => clearInterval(interval);
  }, [akitaAPIKey, akitaAPISecret, akitaProjectName, client, targetContainer, targetPort]);

  return state;
};
