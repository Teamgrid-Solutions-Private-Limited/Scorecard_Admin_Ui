import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
  Button
} from "@mui/material";

function DeleteConfirmationDialog({
  open,
  onClose,
  onConfirm,
  itemName,
  itemType = "item"
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 3, padding: 2, width: "90%", maxWidth: 420 },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: "1.4rem",
          fontWeight: "bold",
          textAlign: "center",
          color: "error.main",
        }}
      >
        Confirm Deletion
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          sx={{
            textAlign: "center",
            fontSize: "1rem",
            color: "text.secondary",
          }}
        >
          Are you sure you want to delete{" "}
          <strong>{itemName}</strong>?
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            width: "100%",
            justifyContent: "center",
            paddingBottom: 2,
          }}
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
            onClick={onConfirm}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2, paddingX: 3 }}
          >
            Delete
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteConfirmationDialog;
