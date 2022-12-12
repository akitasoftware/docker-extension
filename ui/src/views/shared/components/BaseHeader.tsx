import { Theme, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { SxProps } from "@mui/system";
import React from "react";

export interface BaseHeaderProps {
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const BaseHeader = ({ children, sx }: BaseHeaderProps) => (
  <Box sx={{ display: "flex", width: "100%", alignItems: "center", ...sx }} my={1}>
    <Box alignContent={"flex-start"} textAlign={"left"} flexGrow={1}>
      <Typography sx={{ fontWeight: "bolder" }} variant={"h5"}>
        Akita API Extension
      </Typography>
      <Typography variant={"subtitle1"} color={"InactiveCaptionText"}>
        Drop-in Agent for API Monitoring and Observability
      </Typography>
    </Box>
    <Box alignContent={"flex-end"}>{children}</Box>
  </Box>
);
