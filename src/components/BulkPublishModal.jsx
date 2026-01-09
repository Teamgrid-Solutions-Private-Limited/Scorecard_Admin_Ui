import React, { useState, useEffect } from "react";
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
  const [status, setStatus] = useState("published");

  useEffect(() => {
    if (open) {
      setStatus("published");
    }
  }, [open]);

  const handleSave = () => {
    if (!status) {
      console.log("❌ BulkPublishModal: Cannot save - missing status");
      return;
    }

    const payload = {
      publishStatus: status,
    };

    console.log("✅ BulkPublishModal: Applying bulk publish", {
      status,
      selectedCount,
      payload,
    });

    onApply && onApply(payload);
    onClose && onClose();
  };

  const typeLabel = type === "senator" ? "senator(s)" : "representative(s)";

  return (
    <Dialog open={open} onClose={onClose} sx={{ borderRadius: 3, padding: 2,  }}>
      <DialogTitle>Bulk Publish</DialogTitle>
      <DialogContent>
        <DialogContentText className="dialogTitle">
          Change publish status for <strong>{selectedCount}</strong> selected {typeLabel}.
        </DialogContentText>
        <Stack spacing={2} sx={{ mt: 2, maxWidth: 370, mx: "auto" }}>
          <Button
            variant="outlined"
            onClick={() => {
              setStatus("published");
              handleSave();
            }}
            sx={{
              borderRadius: 2,
            //   padding: "8px 16px",
            //   fontSize: "13px",
              "&:hover": {
                backgroundColor: "#2E7D32 !important",
                color: "white !important",
              },
            }}
          >
            Publish
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setStatus("draft");
              handleSave();
            }}
            sx={{
              borderRadius: 2,
            //   padding: "8px 16px",
            //   fontSize: "13px",
              "&:hover": {
                backgroundColor: "#1E4C80 !important",
                color: "white !important",
              },
            }}
          >
            Draft
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
