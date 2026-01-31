import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Stack,
} from "@mui/material";

export default function FetchFromQuorumDialog({
  open,
  onClose,
  onActive,
  onFormer,
  type = "Senator",
}) {
  const noun = type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 3, padding: 2, width: "90%", maxWidth: 420 },
      }}
    >
      <DialogTitle className="dialogBox">
        Fetch {noun}s from Quorum
      </DialogTitle>
      <DialogContent>
        <DialogContentText className="dialogTitle">
          Select the type of {noun.toLowerCase()}s you want to fetch:
        </DialogContentText>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#1E4C80 !important",
                color: "white !important",
                border: "none !important",
              },
            }}
            onClick={onActive}
          >
            Active {noun}s
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#1E4C80 !important",
                color: "white !important",
                border: "none !important",
              },
            }}
            onClick={onFormer}
          >
            Former {noun}s
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          variant="outlined"
          color="secondary"
          sx={{ borderRadius: 2, paddingX: 3 }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
