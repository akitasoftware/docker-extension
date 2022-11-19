import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import { Fab, Theme, Tooltip } from "@mui/material";
import { SxProps } from "@mui/system";
import React from "react";
import { useDockerDesktopClient } from "../../../hooks/use-docker-desktop-client";

export interface FeedBackFABProps {
  sx?: SxProps<Theme>;
}

export const FeedBackFAB = ({ sx }: FeedBackFABProps) => {
  const ddClient = useDockerDesktopClient();

  const handleClick = () => {
    ddClient.host.openExternal("https://forms.gle/hbfRMNweaghxVMUy9");
  };

  return (
    <Tooltip title={"Give Feedback"}>
      <Fab size={"large"} variant={"circular"} color={"primary"} onClick={handleClick} sx={sx}>
        <ForumOutlinedIcon />
      </Fab>
    </Tooltip>
  );
};
