import { DockerMuiThemeProvider } from "@docker/docker-mui-theme";
import CssBaseline from "@mui/material/CssBaseline";
import React from "react";
import ReactDOM from "react-dom";

import { App } from "./App";

ReactDOM.render(
  <React.StrictMode>
    {/*
      If you eject from MUI (which we don't recommend!), you should add
      the `dockerDesktopTheme` class to your root <html> element to get
      some minimal Docker theming.
    */}
    <DockerMuiThemeProvider>
      <CssBaseline />
      <App />
    </DockerMuiThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
