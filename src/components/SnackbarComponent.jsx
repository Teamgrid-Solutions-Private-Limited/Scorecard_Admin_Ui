import * as React from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

export default function SnackbarComponent({
  open,
  onClose,
  message,
  severity,
  selectionError,
}) {
  const effectiveOpen = open || selectionError?.show;
  const effectiveSeverity = selectionError?.show ? "error" : severity;
  const effectiveMessage = selectionError?.show
    ? selectionError.message
    : message;

  const isSuccessPublish =
    effectiveMessage === "Changes published successfully!";

  return (
    <Snackbar
      open={effectiveOpen}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <MuiAlert
        onClose={onClose}
        severity={effectiveSeverity}
        sx={{
          width: "100%",
          border: "none",
          boxShadow: "none",
          bgcolor: isSuccessPublish ? "#daf4f0" : undefined,
          "& .MuiAlert-icon": {
            color: isSuccessPublish ? "#099885" : undefined,
          },
          "& .MuiAlert-message": {
            color: isSuccessPublish ? "#099885" : undefined,
          },
          "& .MuiAlert-action": {
            display: "flex",
            alignItems: "center",
            paddingTop: 0,
            paddingBottom: 0,
          },
        }}
        elevation={6}
        variant="filled"
      >
        {effectiveMessage}
      </MuiAlert>
    </Snackbar>
  );
}
