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
  const result = await client.docker.listContainers();
  console.log("getContainers", result);
  return result as ContainerInfo[];
};

export const useContainers = (): ContainerInfo[] => {
  const client = useDockerDesktopClient();

  const [containers, setContainers] = useState<ContainerInfo[]>([]);

  useEffect(() => {
    getContainers(client).then(setContainers).catch(console.error);
  }, [client]);

  return containers;
};

export const getAkitaContainer = async (
  client: v1.DockerDesktopClient
): Promise<ContainerInfo | undefined> =>
  await getContainers(client).then((containers) =>
    containers.find((container) => isAkitaContainer(container))
  );

export const startAkitaAgent = async (client: v1.DockerDesktopClient, config?: AgentConfig) => {
  if (!config) return;

  const container = await getAkitaContainer(client);
  if (container) return;

  // Pull the latest image of Akita CLI
  await client.docker.cli.exec("pull", ["public.ecr.aws/akitasoftware/akita-cli:latest"]);

  // Start the Akita agent
  const networkArg = config.target_container ? `container:${config.target_container}` : "host";
  const runArgs = [
    "--rm",
    `--network ${networkArg}`,
    "--name akita-docker-extension-agent",
    `-e AKITA_API_KEY_ID=${config.api_key}`,
    `-e AKITA_API_KEY_SECRET=${config.api_secret}`,
    "akitasoftware/cli:latest apidump",
    `--project ${config.project_name}`,
  ];
  if (config.target_port) {
    runArgs.push(`--filter "port ${config.target_port}"`);
  }

  console.log("Starting Akita agent with args:", runArgs);

  await client.docker.cli.exec("run", runArgs);
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
