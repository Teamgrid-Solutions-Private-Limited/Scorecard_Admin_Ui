import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MenuContent from "./MenuContent";
import logo from "../assets/image/logo-dark.png";

const MobileHeader = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (state) => () => {
    setOpen(state);
  };

  return (
    <>
      {/* Mobile Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          pr: 1,
          display: { xs: "flex", md: "none" },
          backgroundColor: "#fff",
          color: "#363837",
          // borderBottom: "4px solid rgba(0,0,0,0.05)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box
  component="img"
  src={logo} 
  alt="SBA Scorecard Logo"
  sx={{
    height: 32, 
    width: "auto",
    objectFit: "contain",
    display: "block",
  }}
/>


          <IconButton edge="end" color="inherit" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer for Menu */}
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            width: 260,
            backgroundColor: "#fff",
            borderRadius: "0 8px 8px 0",
          },
        }}
      >
      
        <Box role="presentation" sx={{ height: "100%" }}>
          <MenuContent />
        </Box>
      </Drawer>
    </>
  );
};

export default MobileHeader;
