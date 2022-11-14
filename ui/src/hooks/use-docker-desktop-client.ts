// eslint-disable-next-line import/no-unresolved
import { createDockerDesktopClient } from "@docker/extension-api-client";
import { v1 } from "@docker/extension-api-client-types";

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client: v1.DockerDesktopClient = createDockerDesktopClient();

export const useDockerDesktopClient = () => client;
