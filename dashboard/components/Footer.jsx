import React from "react";
import { Box, Typography } from "@mui/material";
import digitalAlchemy from '../../src/assets/image/digital-alchemy.png'
const Footer = () => {
  return (
    <Box
      sx={{
        m: "20px",
        // ml: { xs: "20px", md: "260px" },
        backgroundColor: "#fff",
        padding: "20px",
        textAlign: "center",
        marginTop: "20px",
        borderRadius: "6px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontFamily: "'Be Vietnam Pro', sans-serif",
            fontSize: "13px",
            color: "#7d7f87",
          }}
        >
          © 2025 Susan B. Anthony Pro–life America
        </Typography>
        <Typography
          variant="body2"
          sx={{
            display:"flex",
            gap:"5px",
            fontSize: "13px",
            fontFamily: "'Be Vietnam Pro', sans-serif",
            color: "#7d7f87",
            mt: 1,
          }}
        >
          Developed by <img src={digitalAlchemy} alt="Digital Alchemy" style={{ height: '20px' }} />
        </Typography>

      </Box>
    </Box>
  );
};

export default Footer;
