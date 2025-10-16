import * as React from "react";
import { styled } from "@mui/material/styles";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import MenuContent from "./MenuContent";
import logo from "../../src/assets/image/logos/sba-logo3.svg";

const drawerWidth = 250;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

export default function SideMenu() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "#173A5E !important",
          backgroundImage: "none !important",
          boxShadow: "none !important",
          color: "#FFFFFF !important",
          "& .MuiTypography-root": {
            color: "#FFFFFF !important",
          },
          "& .MuiListItemIcon-root": {
            color: "#FFFFFF !important",
          },
          "& .MuiSvgIcon-root": {
            color: "#FFFFFF !important",
          },
          "& .MuiListItemButton-root:hover": {
            color: "#FFFFFF !important",
            "& .MuiListItemIcon-root": {
              color: "#FFFFFF !important",
            },
            "& .MuiSvgIcon-root": {
              color: "#FFFFFF !important",
            },
          },
          "& .MuiListItemButton-root.active": {
            color: "#FFFFFF !important",
            "& .MuiListItemIcon-root": {
              color: "#FFFFFF !important",
            },
            "& .MuiSvgIcon-root": {
              color: "#FFFFFF !important",
            },
          },
        },
      }}
    >
      <Stack
        direction="row"
        sx={{
          p: 5,
          gap: 1,
          alignItems: "center",
          borderColor: "divider",
        }}
      >
        <img
          className="logo-lg"
          src={logo}
          style={{ width: "155px", height: "auto" }}
        />
      </Stack>

      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MenuContent />
      </Box>
    </Drawer>
  );
}
