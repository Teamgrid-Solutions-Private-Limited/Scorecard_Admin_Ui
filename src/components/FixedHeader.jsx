import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

const FixedHeader = () => {
  const [elevate, setElevate] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setElevate(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box
      sx={{
        display: { xs: "none", md: "flex" },
        justifyContent: "center",
        backgroundColor: "#fff",
        padding: elevate ? "35px 0px":"40px 0px",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: elevate ? "0 2px 10px rgba(0, 0, 0, 0.2)" : "none",
        borderRadius: elevate? "5px":"0px",
        transition: " 0.2s ease-in-out",
      }}
    >
      <Typography
        variant="h5"
        align="center"
        sx={{
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontWeight: 600,
          color: "#363837",
        }}
      >
        SBA Scorecard Management System
      </Typography>
    </Box>
  );
};

export default FixedHeader;
