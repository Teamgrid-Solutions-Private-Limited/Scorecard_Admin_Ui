import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Stack,
} from "@mui/material";

export default function BulkPublishModal({
  open,
  onClose,
  selectedCount = 0,
  onApply,
  type = "senator",
}) {
  const typeLabel =
    type === "senator"
      ? selectedCount === 1
        ? "senator"
        : "senators"
      : selectedCount === 1
      ? "representative"
      : "representatives";

  const handlePublish = () => {
    const payload = { publishStatus: "published" };
    onApply && onApply(payload);
    onClose && onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 3, padding: 2, width: "90%", maxWidth: 420 },
      }}
    >
      <DialogTitle className="dialogBox">Confirm Publish</DialogTitle>

      <DialogContent>
        <DialogContentText className="dialogTitle">
          Are you sure you want to publish{" "}
          <strong>{selectedCount}</strong> selected {typeLabel}?
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Stack
          direction="row"
          spacing={2}
          sx={{ width: "100%", justifyContent: "center", paddingBottom: 2 }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            color="secondary"
            sx={{ borderRadius: 2, paddingX: 3 }}
          >
            Cancel
          </Button>

         <Button
  onClick={handlePublish}
  variant="contained"
  color="success"
  sx={{
    borderRadius: 2,
    paddingX: 3,
        boxShadow: "none",                 // optional: remove default shadow

    "&:hover": {
      backgroundColor: "#4CAF50",  
          boxShadow: "none",                 // optional: remove default shadow
      // ✅ lighter green on hover
    },
  }}
>
  Publish
</Button>

        </Stack>
      </DialogActions>
    </Dialog>
  );
}
