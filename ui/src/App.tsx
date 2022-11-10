import React from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { ConfigPage } from "./views/ConfigPage";
import { Root } from "./views/Root";
import { AgentPage } from "./views/agent/AgentPage";

export function App() {
  return (
    // BrowserRouter is not used because it does not work with Docker Desktop
    <HashRouter>
      <Routes>
        <Route path={"/"} element={<Root />} />
        <Route path={"/config"} element={<ConfigPage />} />
        <Route path={"/agent"} element={<AgentPage />} />
      </Routes>
    </HashRouter>
  );
}
