import { Box, Theme } from "@mui/material";
import { SxProps } from "@mui/system";
import React from "react";

interface YoutubePlayerProps {
  embedId: string;
  title?: string;
  sx?: SxProps<Theme>;
}

export const YouTubePlayer = ({ embedId, title, sx }: YoutubePlayerProps) => (
  <Box className={"youtube-player"} sx={sx}>
    <iframe
      title={title ?? "YouTube Embed"}
      src={`https://www.youtube.com/embed/${embedId}`}
      allow={
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      }
      allowFullScreen
      width={"100%"}
    />
  </Box>
);
