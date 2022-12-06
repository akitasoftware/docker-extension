import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlined";
import OndemandVideoOutlinedIcon from "@mui/icons-material/OndemandVideoOutlined";
import { SpeedDial, SpeedDialAction, Theme } from "@mui/material";
import { SxProps } from "@mui/system";
import React, { MouseEvent, ReactNode, useState } from "react";
import { useDockerDesktopClient } from "../../../hooks/use-docker-desktop-client";
import { YouTubePlayer } from "./YouTubePlayer";

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
  const [isVideoOpen, setIsVideoOpen] = useState<boolean>(false);

  const actions: Action[] = [
    {
      icon: <ForumOutlinedIcon />,
      name: "Give Feedback",
      operation: () => {
        ddClient.host.openExternal("https://forms.gle/hbfRMNweaghxVMUy9");
      },
    },
    {
      icon: <OndemandVideoOutlinedIcon />,
      name: "View Tutorial Video",
      operation: () => {
        setIsVideoOpen(true);
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

  const handleVideoClose = () => {
    setIsVideoOpen(false);
  };

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
      <YouTubePlayer
        title={"Tutorial Video"}
        embedId={"TMOxq4yjKYE"}
        open={isVideoOpen}
        onClose={handleVideoClose}
      />
    </>
  );
};
