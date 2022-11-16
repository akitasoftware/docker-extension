import { v1 } from "@docker/extension-api-client-types";
import { useEffect, useState } from "react";
import { useDockerDesktopClient } from "../../hooks/use-docker-desktop-client";
import { AgentConfig } from "./agent-config";

export const AgentContainerName = "akita-docker-extension-agent";
export const AgentImageName = "akitasoftware/cli:latest";

export enum ContainerState {
  CREATED = "created",
  RUNNING = "running",
  RESTARTING = "restarting",
  EXITED = "exited",
  PAUSED = "paused",
  DEAD = "dead",
  NONE = "none",
}

export type ContainerInfo = {
  Id: string;
  Image: string;
  Command: string;
  Names: string[];
  State: ContainerState;
  Labels: Record<string, string>;
};

export const getContainers = async (client: v1.DockerDesktopClient): Promise<ContainerInfo[]> => {
  const result = await client.docker.listContainers({ all: true });
  return result as ContainerInfo[];
};

export const getContainer = async (
  client: v1.DockerDesktopClient,
  containerID?: string
): Promise<ContainerInfo | undefined> =>
  await getContainers(client).then((containers) =>
    containers.find((container) => container.Id === containerID)
  );

export const useContainers = (): ContainerInfo[] => {
  const client = useDockerDesktopClient();

  const [containers, setContainers] = useState<ContainerInfo[]>([]);

  useEffect(() => {
    getContainers(client).then(setContainers).catch(console.error);
  }, [client]);

  return containers;
};

export const getAkitaContainer = async (client: v1.DockerDesktopClient): Promise<ContainerInfo> =>
  await getContainers(client).then((containers) =>
    containers.find((container) => isAkitaContainer(container))
  );

export const startAgentWithRetry = async (
  client: v1.DockerDesktopClient,
  config: AgentConfig,
  maxRetries = 5
): Promise<ContainerInfo> => {
  const container: ContainerInfo | undefined = await getAkitaContainer(client).catch((err) => {
    console.error(err);
    return undefined;
  });

  // If the container already exists, return it.
  if (container) return container;

  // Helper function to retry starting the agent
  const retry = async (attempts: number): Promise<ContainerInfo> =>
    Promise.resolve()
      .then(() => startAkitaAgent(client, config))
      .catch((err) => {
        if (attempts < maxRetries) {
          console.error(`Failed to start Akita agent. Retrying... attempts: ${attempts + 1}`);
          return retry(attempts + 1);
        }
        return Promise.reject(err);
      });

  return retry(0);
};

const startAkitaAgent = async (
  client: v1.DockerDesktopClient,
  config?: AgentConfig
): Promise<ContainerInfo> => {
  if (!config) return;

  let container = await getAkitaContainer(client);
  if (container) {
    console.log("Akita agent already running. container:", container);
    return container;
  }

  // Pull the latest image of Akita CLI
  await client.docker.cli.exec("pull", ["public.ecr.aws/akitasoftware/akita-cli:latest"]);

  // Start the Akita agent
  const networkArg = config.target_container ? `container:${config.target_container}` : "host";
  const runArgs = [
    "--rm",
    `--network ${networkArg}`,
    `--name ${AgentContainerName}`,
    `-e AKITA_API_KEY_ID=${config.api_key}`,
    `-e AKITA_API_KEY_SECRET=${config.api_secret}`,
    `${AgentImageName} apidump`,
    `--project ${config.project_name}`,
  ];
  if (config.target_port) {
    runArgs.push(`--filter "port ${config.target_port}"`);
  }

  console.log("Starting Akita agent with args:", runArgs);

  await client.docker.cli.exec("run", runArgs);

  let fetchAttempts = 0;

  // Poll for agent container info using the `docker ps` command
  const interval = setInterval(() => {
    console.log("Fetching container info. fetchAttempts:", fetchAttempts);
    try {
      container = void getAkitaContainer(client);
      if (container) {
        clearInterval(interval);
      } else {
        fetchAttempts++;
      }
    } catch (err) {
      if (fetchAttempts >= 5) {
        clearInterval(interval);
        throw err;
      }
      fetchAttempts++;
    }
  }, 3000);

  return container ?? (await Promise.reject(new Error("Failed to fetch Akita agent container")));
};

export const removeAkitaContainer = async (client: v1.DockerDesktopClient) => {
  const container = await getAkitaContainer(client);
  if (container) {
    await client.docker.cli.exec("rm", ["-f", container.Id]);
  }
};

const isAkitaContainer = (containerInfo?: ContainerInfo): boolean => {
  const doesMatchContainerName = containerInfo?.Names.some((name) =>
    name.includes(AgentContainerName)
  );
  const doesMatchImageName = containerInfo?.Image.includes(AgentImageName);
  const isDockerExtension = containerInfo?.Labels["com.docker.desktop.extension"] === "true";

  return doesMatchContainerName && doesMatchImageName && isDockerExtension;
};
