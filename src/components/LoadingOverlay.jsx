import * as React from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export default function LoadingOverlay({ loading }) {
  if (!loading) return null;
  return (
    <Box className="circularLoader">
      <CircularProgress sx={{ color: "#CC9A3A !important" }} />
    </Box>
  );
}


