import { v1 } from "@docker/extension-api-client-types";
import { AgentContainerName, AgentImageName } from "./agent";

export enum ContainerState {
  CREATED = "created",
  RUNNING = "running",
  RESTARTING = "restarting",
  EXITED = "exited",
  PAUSED = "paused",
  DEAD = "dead",
}

export type ContainerInfo = {
  ID: string;
  Image: string;
  Command: string;
  Names: string[];
  State: ContainerState;
  Labels: Record<string, string>;
};

export const isContainerRunning = (containerInfo?: ContainerInfo): boolean =>
  containerInfo && containerInfo.State === ContainerState.RUNNING;

export const isContainerStarting = (containerInfo?: ContainerInfo): boolean =>
  containerInfo &&
  (containerInfo.State === ContainerState.CREATED ||
    containerInfo.State === ContainerState.RESTARTING);

export const isContainerStopped = (containerInfo?: ContainerInfo): boolean =>
  containerInfo &&
  (containerInfo.State === ContainerState.EXITED ||
    containerInfo.State === ContainerState.DEAD ||
    containerInfo.State === ContainerState.PAUSED);

export const getAkitaAgentContainer = async (
  client: v1.DockerDesktopClient
): Promise<ContainerInfo | undefined> => {
  const containers = (await client.docker.listContainers()) as ContainerInfo[];
  return containers.find(isAkitaAgentContainer);
};

const isAkitaAgentContainer = (containerInfo?: ContainerInfo): boolean => {
  const doesMatchContainerName = containerInfo?.Names.some((name) =>
    name.includes(AgentContainerName)
  );
  const doesMatchImageName = containerInfo?.Image.includes(AgentImageName);
  const isDockerExtension = containerInfo?.Labels["com.docker.desktop.extension"] === "true";

  return doesMatchContainerName && doesMatchImageName && isDockerExtension;
};
