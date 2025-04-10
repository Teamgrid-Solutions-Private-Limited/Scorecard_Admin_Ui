import React from "react";
import { Box, Typography } from "@mui/material";

const FixedHeader = () => {
  return (
    <Box
      sx={{
        display: {  xs: "none", md: "flex" },

        justifyContent: "center",
        // ml: { xs: 0, md: "260px" },
        backgroundColor: "#fff",
        padding: "40px 0px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <Typography
        variant="h5"
        align="center"
        sx={{
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontWeight: "600",
          color: "#363837",
        }}
      >
        SBA Scorecard Management System
      </Typography>
    </Box>
  );
};

export default FixedHeader;
