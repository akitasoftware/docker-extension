import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import React from "react";
import ReactPlayer from "react-player";

interface YoutubePlayerProps {
  embedId: string;
  open: boolean;
  title: string;
  onClose: () => void;
}

export const YouTubePlayer = ({ embedId, open, title, onClose }: YoutubePlayerProps) => (
  <Dialog open={open} onClose={onClose} maxWidth={"xl"}>
    <DialogTitle sx={{ m: 0, p: 2 }}>
      {title}
      <IconButton
        onClick={onClose}
        aria-label={"close"}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
        }}
      >
        <CloseOutlinedIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <ReactPlayer
        light
        url={`https://youtu.be/${embedId}`}
        controls
        youtube={{
          playerVars: { fs: 1 },
        }}
      />
    </DialogContent>
  </Dialog>
);
