import React, { CSSProperties } from "react";

interface YoutubeEmbedProps {
  embedId: string;
  title?: string;
  style?: CSSProperties;
}

export const YoutubeEmbed = ({ embedId, title, style }: YoutubeEmbedProps) => (
  <div className={"video-responsive"}>
    <iframe
      title={title ?? "YouTube Embed"}
      src={`https://www.youtube.com/embed/${embedId}`}
      allow={
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      }
      allowFullScreen
      style={style}
    />
  </div>
);
