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

  // Check for deletion success messages
  const isDeletionSuccess = effectiveMessage?.includes("deleted successfully.");

  // Check for fetch/bulk operation success messages
  const isFetchOrBulkSuccess = effectiveMessage?.toLowerCase().includes("fetched successfully!") ||
    effectiveMessage?.toLowerCase().includes("bulk select applied") ||
    effectiveMessage?.toLowerCase().includes("bulk publish applied");

  // Determine colors based on message type
  let customBgColor = undefined;
  let customIconColor = undefined;
  let customMessageColor = undefined;

  if (isDeletionSuccess) {
    customBgColor = "#fde8e4";
    customIconColor = "#cc563d";
    customMessageColor = "#cc563d";
  } else if (isSuccessPublish || isFetchOrBulkSuccess) {
    customBgColor = "#daf4f0";
    customIconColor = "#099885";
    customMessageColor = "#099885";
  }

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
          bgcolor: customBgColor,
          "& .MuiAlert-icon": {
            color: customIconColor,
          },
          "& .MuiAlert-message": {
            color: customMessageColor,
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
