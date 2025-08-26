import * as React from "react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import AddIcon from "@mui/icons-material/Add";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";

import { jwtDecode } from "jwt-decode";

const getRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return jwtDecode(token).role;
  } catch {
    return null;
  }
};

const mainListItems = [
  { text: "Senators", icon: <GavelRoundedIcon />, link: "/" },
  {
    text: "Representatives",
    icon: <GroupsRoundedIcon />,
    link: "/representative",
  },
  { text: "Votes We Scored", icon: <DescriptionRoundedIcon />, link: "/bills" },
  {
    text: "Activities We Track",
    icon: <CalendarTodayRoundedIcon />,
    link: "/activities",
  },
  { text: "Manage Terms", icon: <AddIcon />, link: "/manage-term" },
];

export default function MenuContent() {
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const role = getRole();
  const menuItems =
    role === "admin"
      ? [
          ...mainListItems,
          {
            text: "Manage Users",
            icon: <PersonAddAltRoundedIcon />,
            link: "/manage-user",
          },
        ]
      : mainListItems;

  const handleLogoutClick = (event) => {
    event.stopPropagation(); // Prevent event bubbling
    setOpenLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    setOpenLogoutDialog(false);
    window.location.href = "/scorecard/admin/login";
  };

  const handleCancelLogout = () => {
    setOpenLogoutDialog(false);
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {menuItems.map((item, index) => (
          <ListItem
            key={index}
            disablePadding
            sx={{
              display: "block",
              mt: index === 0 ? 1 : 0, // Reduced top margin for the first item

              mb: index < menuItems.length - 1 ? 1 : 0, // Reduced bottom margin for all items except the last
            }}
          >
            <ListItemButton
              component={NavLink}
              to={item.link}
              sx={{
                "&:hover": {
                  color: "#CC9A3A !important",
                  "& .MuiListItemIcon-root": {
                    color: "#CC9A3A !important",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#CC9A3A !important",
                  },
                  backgroundColor: "rgba(240, 240, 240, 0.2)", // Even lighter gray background on hover
                },
                "&.active": {
                  color: "#CC9A3A !important",
                  "& .MuiListItemIcon-root": {
                    color: "#CC9A3A !important",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#CC9A3A !important",
                  },
                  backgroundColor: "rgba(240, 240, 240, 0.2)", // Even lighter gray background for active
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        <ListItem disablePadding sx={{ display: "block" }}>
          <ListItemButton
            onClick={handleLogoutClick}
            sx={{
              "&:hover": {
                "& .MuiListItemIcon-root": {
                  color: "#CC9A3A",
                },
                "& .MuiListItemText-root": {
                  color: "#CC9A3A",
                },
              },
            }}
          >
            <ListItemIcon>
              <LogoutRoundedIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>

        <Dialog
          open={openLogoutDialog}
          onClose={handleCancelLogout}
          PaperProps={{
            sx: { borderRadius: 3, padding: 2, width: '90%', maxWidth: 400 },
          }}
      >
        <DialogTitle
          sx={{
            fontSize: "1.4rem",
            fontWeight: "500",
            textAlign: "center",
          }}
        >
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              textAlign: "center",
              fontSize: "1rem",
              color: "text.secondary",
            }}
          >
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Stack
            direction="row"
            spacing={2}
            sx={{ width: "100%", justifyContent: "center", paddingBottom: 2 }}
          >
            <Button
              onClick={handleCancelLogout}
              variant="outlined"
              color="secondary"
              sx={{ borderRadius: 2, paddingX: 3 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmLogout}
              variant="contained"
              color="error"
              sx={{ borderRadius: 2, paddingX: 3 }}
            >
              Logout
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}