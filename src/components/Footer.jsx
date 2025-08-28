import React from "react";
import { Box, Typography } from "@mui/material";
import digitalAlchemy from "../../src/assets/image/digital-alchemy.png";
const Footer = () => {
  return (
   <Box
      sx={{
        mx: "20px",
        // ml: { xs: "20px", md: "260px" },
        // backgroundColor: "#fff",
                // backgroundColor: "#ab4141ff",
 
        padding: "0px",
        textAlign: "center",
        marginTop: "40px",
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
          © {new Date().getFullYear()} Susan B. Anthony Pro–life America
        </Typography>
        <Typography
          variant="body2"
          sx={{
            display: "flex",
            gap: "5px",
            fontSize: "13px",
            fontFamily: "'Be Vietnam Pro', sans-serif",
            color: "#7d7f87",
            mt: 1,
          }}
        >
          <a href="https://godigitalalchemy.com/" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "5px", textDecoration: "none", color: "inherit" }}>
            Developed by{" "}
            <img
              src={digitalAlchemy}
              alt="Digital Alchemy"
              style={{ height: "20px" }}
            />
          </a>
        </Typography>
      </Box>
    </Box>
  );
};
 
export default Footer;