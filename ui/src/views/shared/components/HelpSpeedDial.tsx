import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlined";
import { SpeedDial, SpeedDialAction, Theme } from "@mui/material";
import { SxProps } from "@mui/system";
import React, { MouseEvent, ReactNode } from "react";
import { useDockerDesktopClient } from "../../../hooks/use-docker-desktop-client";

export interface HelpSpeedDialProps {
  sx?: SxProps<Theme>;
}

interface Action {
  icon: ReactNode;
  name: string;
  operation: () => void;
}

export const HelpSpeedDial = ({ sx }: HelpSpeedDialProps) => {
  const ddClient = useDockerDesktopClient();

  const actions: Action[] = [
    {
      icon: <ForumOutlinedIcon />,
      name: "Give Feedback",
      operation: () => {
        ddClient.host.openExternal("https://forms.gle/hbfRMNweaghxVMUy9");
      },
    },
    {
      icon: <ArticleOutlinedIcon />,
      name: "View Documentation",
      operation: () => {
        ddClient.host.openExternal("https://docs.akita.software/docs/docker-extension");
      },
    },
  ];

  const handleActionClick = (event: MouseEvent<HTMLDivElement>, action: Action) => {
    action.operation();
  };

  return (
    <>
      <SpeedDial ariaLabel={"help-speed-dial"} sx={sx} icon={<HelpOutlineIcon />}>
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={(e) => handleActionClick(e, action)}
          />
        ))}
      </SpeedDial>
    </>
  );
};
