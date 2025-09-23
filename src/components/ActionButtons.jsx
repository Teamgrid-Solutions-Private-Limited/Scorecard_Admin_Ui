import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

export default function ActionButtons({ onDiscard, onSave, userRole }) {
  return (
    <Stack direction="row" spacing={2} width="100%" sx={{ justifyContent: "flex-end", alignItems: "center" }}>
      <Button
        variant="outlined"
        onClick={onDiscard}
        sx={{
          backgroundColor: "#E24042 !important",
          color: "white !important",
          padding: "0.5rem 1.5rem",
          marginLeft: "0.5rem",
          "&:hover": { backgroundColor: "#C91E37 !important" },
        }}
      >
        {userRole === "admin" ? "Discard" : "Undo"}
      </Button>
      <Button
        variant="outlined"
        onClick={onSave}
        sx={{
          backgroundColor: "#173A5E !important",
          color: "white !important",
          padding: "0.5rem 1.5rem",
          marginLeft: "0.5rem",
          "&:hover": { backgroundColor: "#1E4C80 !important" },
        }}
      >
        {userRole === "admin" ? "Publish" : "Save Changes"}
      </Button>
    </Stack>
  );
}


