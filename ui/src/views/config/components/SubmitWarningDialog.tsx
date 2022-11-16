import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import React from "react";

export interface SubmitWarningDialogProps {
  onClose: () => void;
  onConfirm: () => void;
  isOpen: boolean;
}

export const SubmitWarningDialog = ({ onClose, onConfirm, isOpen }: SubmitWarningDialogProps) => (
  <Container maxWidth={"lg"}>
    <Dialog open={isOpen} onClose={onClose} fullWidth={true}>
      <DialogTitle>Ensure Docker Extension Containers are viewable</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <strong>&quot;Show Docker Extension Containers&quot;</strong> must be enabled for this
          extension to work. To enable, got to <strong>Preferences</strong> &gt;{" "}
          <strong>Extension</strong> and check the &quot;Show Docker Extension Containers&quot;
          checkbox.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant={"outlined"}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant={"contained"}>
          Confirm & Start
        </Button>
      </DialogActions>
    </Dialog>
  </Container>
);
