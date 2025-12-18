import * as React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

export default function ActionButtons({ onDiscard, onSave, userRole }) {
  return (
    <Stack direction="row" spacing={2} width="100%" sx={{ justifyContent: "flex-end", alignItems: "center" }}>
  {userRole === "admin" ?    <Button
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
        {/* {userRole === "admin" ? "Discard" : null} */}
      </Button>: null}

      {userRole === "admin" ? (
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
           sx ={{
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
      )}
    </Stack>
  );
}


