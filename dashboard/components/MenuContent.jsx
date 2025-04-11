import * as React from "react";
import { NavLink } from "react-router-dom";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupRounded"
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded"; // ✅ Added
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded"; // ✅ Added

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import AddIcon from '@mui/icons-material/Add';

const mainListItems = [
  { text: "Senate", icon: <GavelRoundedIcon />, link: "/" },
  {
    text: "Representative",
    icon: <GroupsRoundedIcon />,
    link: "/representative",
  },
  { text: "Bill We Track", icon: <DescriptionRoundedIcon />, link: "/bills" }, // Updated icon for Bills
  { text: "Add Term", icon: <AddIcon />, link: "/manage-term"},
];

export default function MenuContent() {
  const handleLogout = () => {
    localStorage.removeItem("token");
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem
            key={index}
            disablePadding
            sx={{
              display: "block",
              mt: index === 0 ? 2 : 0, // Add margin-top for the first item (Senate)
              mb: index < mainListItems.length - 1 ? 2 : 0, // Add margin-bottom between items
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
                  // borderLeft: "4px solid #CC9A3A", // Add left border on hover
                  // backgroundColor: "rgba(204, 154, 58, 0.1)", // Light background for hover
                },
                "&.active": {
                  color: "#CC9A3A !important",
                  "& .MuiListItemIcon-root": {
                    color: "#CC9A3A !important",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#CC9A3A !important",
                  },
                  // borderLeft: "4px solid #CC9A3A", // Add left border when active
                  // backgroundColor: "rgba(243, 241, 236, 0.98)", // Slightly darker background for active
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
            component={NavLink}
            to="/login"
            onClick={handleLogout}
            sx={{
              "&:hover": {
                "& .MuiListItemIcon-root": {
                  color: "#CC9A3A",
                },
                "& .MuiListItemText-root": {
                  color: "#CC9A3A",
                },
              },
              "&.active .MuiListItemIcon-root": {
                color: "#CC9A3A",
              },
              "&.active .MuiListItemText-root": {
                color: "#CC9A3A",
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
    </Stack>
  );
}
