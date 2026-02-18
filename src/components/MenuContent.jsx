import { NavLink } from "react-router-dom";
import { useState } from "react";
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
import AddIcon from "@mui/icons-material/Add";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";

import { getUserRole, logout } from "../utils/auth";
import { clearPaginationStorage } from "../utils/storage";
const mainListItems = [
  { text: "Senators", icon: <GavelRoundedIcon sx={{ fontSize: 40 }} />, link: "/" },
  {
    text: "Representatives",
    icon: <GroupsRoundedIcon sx={{ fontSize: 40 }} />,
    link: "/representative",
  },
  { text: "Votes We Scored", icon: <DescriptionRoundedIcon sx={{ fontSize: 40 }} />, link: "/votes" },
  {
    text: "Activities We Track",
    icon: <CalendarTodayRoundedIcon sx={{ fontSize: 40 }} />,
    link: "/activities",
  },
  { text: "Manage Terms", icon: <AddIcon sx={{ fontSize: 40 }} />, link: "/manage-term" },
];

export default function MenuContent() {
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const role = getUserRole();
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
    event.stopPropagation();
    setOpenLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setOpenLogoutDialog(false);
    window.location.href = "/login";
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
              mt: index === 0 ? 1 : 0, 
              mb: index < menuItems.length - 1 ? 1 : 0, 
            }}
          >
            <ListItemButton
              component={NavLink}
              to={item.link}
               onClick={clearPaginationStorage} 
              sx={{

                "& .MuiListItemText-primary": {
                  fontWeight: "300 !important",
                  lineHeight: "2.2 !important",
                },

                "&:hover": {
                  color: "#CC9A3A !important",
                  "& .MuiListItemIcon-root": {
                    color: "#CC9A3A !important",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#CC9A3A !important",
                  },
                  backgroundColor: "rgba(240, 240, 240, 0.2)", 
                },
                "&.active": {
                  color: "#CC9A3A !important",
                  "& .MuiListItemIcon-root": {
                    color: "#CC9A3A !important",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#CC9A3A !important",
                  },
                  backgroundColor: "rgba(240, 240, 240, 0.2)", 
                },
              }}
            >
              <ListItemIcon sx={{
                "& .MuiSvgIcon-root": {
                  fontSize: "23px !important",
                  width: "23px !important",
                  height: "23px !important",
                },
              }}>{item.icon}</ListItemIcon>
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
          sx: { borderRadius: 3, padding: 2, width: '90%', maxWidth: 420 },
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
              sx={{ borderRadius: 2, paddingX: 3, "&:hover": { backgroundColor: "#f22727ff" } }}
            >
              Logout
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
