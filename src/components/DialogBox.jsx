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

function DialogBox({ userRole, openDiscardDialog, setOpenDiscardDialog ,handleConfirmDiscard}) {
  return (
    <Dialog
      open={openDiscardDialog}
      onClose={() => setOpenDiscardDialog(false)}
      PaperProps={{
        sx: { borderRadius: 3, padding: 2, minWidth: 350 },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: "1.4rem",
          fontWeight: "bold",
          textAlign: "center",
          color: "warning.main",
        }}
      >
        {userRole === "admin" ? "Discard" : "Undo"} Changes?
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          sx={{
            textAlign: "center",
            fontSize: "1rem",
            color: "text.secondary",
          }}
        >
          Are you sure you want to {userRole === "admin" ? "discard" : "undo"}{" "}
          all changes? <br />
          <strong>This action cannot be undone.</strong>
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
            onClick={() => setOpenDiscardDialog(false)}
            variant="outlined"
            color="secondary"
            sx={{ borderRadius: 2, paddingX: 3 }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleConfirmDiscard}
            variant="contained"
            color="warning"
            sx={{ borderRadius: 2, paddingX: 3 }}
          >
            {userRole === "admin" ? "Discard" : "Undo"}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

export default DialogBox;
