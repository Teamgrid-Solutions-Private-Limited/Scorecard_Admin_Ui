import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useParams } from "react-router-dom";

export default function ActionButtons({ onDiscard, onSave, userRole }) {
  const { id } = useParams(); // Get the ID from URL params
  const isNewRecord = !id; // Check if this is a new record (no ID)

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
        Discard
      </Button>

      {isNewRecord ? (
        // For new records - show Create button
        <Button
          variant="outlined"
          onClick={() => onSave(false)}
           className="publishBtn"
        >
          Create
        </Button>
      ) : (
        // For existing records - show Save Draft/Publish based on user role
        userRole === "admin" ? (
          <>
            <Button
              variant="outlined"
              onClick={() => onSave(false)}
              sx={{
                backgroundColor: "#173A5E !important",
                color: "white !important",
                padding: "0.5rem 1.5rem",
                marginLeft: "0.5rem",
                "&:hover": { backgroundColor: "#1E4C80 !important" },
              }}
            >
              Save Draft
            </Button>
            <Button
              variant="outlined"
              onClick={() => onSave(true)}
              sx={{
                backgroundColor: "#2E7D32 !important",
                color: "white !important",
                padding: "0.5rem 1.5rem",
                marginLeft: "0.5rem",
                "&:hover": { backgroundColor: "#216A2A !important" },
              }}
            >
              Publish
            </Button>
          </>
        ) : (
          <Button
            variant="outlined"
            onClick={() => onSave(false)}
            sx={{
              backgroundColor: "#173A5E !important",
              color: "white !important",
              padding: "0.5rem 1.5rem",
              marginLeft: "0.5rem",
              "&:hover": { backgroundColor: "#1E4C80 !important" },
            }}
          >
            Save Draft
          </Button>
        )
      )}
    </Stack>
  );
}