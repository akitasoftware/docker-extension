import { v1 } from "@docker/extension-api-client-types";
import { useEffect, useState } from "react";
import { useDockerDesktopClient } from "../../hooks/use-docker-desktop-client";
import { retryPromise } from "../../utils/promise";
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

export const getContainers = async (
  client: v1.DockerDesktopClient,
  predicate?: (ContainerInfo) => boolean
): Promise<ContainerInfo[]> =>
  await client.docker
    .listContainers({ all: true })
    .then((containers: ContainerInfo[]) => (predicate ? containers.filter(predicate) : containers));

export const getContainer = async (
  client: v1.DockerDesktopClient,
  containerID?: string
): Promise<ContainerInfo | undefined> =>
  await getContainers(client).then((containers) =>
    containers.find((container) => container.Id === containerID)
  );

export const useContainers = (predicate?: (ContainerInfo) => boolean): ContainerInfo[] => {
  const client = useDockerDesktopClient();

  const [containers, setContainers] = useState<ContainerInfo[]>([]);

  useEffect(() => {
    getContainers(client, predicate).then(setContainers).catch(console.error);
  }, [predicate, client]);

  return containers;
};

export const getAkitaContainer = async (client: v1.DockerDesktopClient): Promise<ContainerInfo> =>
  await getContainers(client).then((containers) =>
    containers.find((container) => isAkitaContainer(container))
  );

export const startAgentWithRetry = async (
  client: v1.DockerDesktopClient,
  config: AgentConfig,
  maxRetries = 3
): Promise<ContainerInfo> => {
  const container: ContainerInfo | undefined = await getAkitaContainer(client).catch((err) => {
    console.error(err);
    return undefined;
  });

  // If the container already exists, return it.
  if (container) return container;

  return retryPromise(() => startAkitaAgent(client, config), maxRetries, 1000).catch((err) =>
    Promise.reject(err)
  );
};

const startAkitaAgent = async (
  client: v1.DockerDesktopClient,
  config?: AgentConfig
): Promise<ContainerInfo> => {
  if (!config) return;

  // Poll for agent container info using the `docker ps` command
  return retryPromise(() => getAkitaContainer(client), 3, 2000).catch((err) => Promise.reject(err));
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
