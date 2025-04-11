import * as React from "react";
import { NavLink } from "react-router-dom";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import AddIcon from '@mui/icons-material/Add';

const mainListItems = [
  { text: "Senate", icon: <HomeRoundedIcon />, link: "/" },
  // { text: "Add Senator", icon: <PeopleRoundedIcon />, link: "/add-senator" },
  {
    text: "Representative",
    icon: <AnalyticsRoundedIcon />,
    link: "/representative",
  },
  // {
  //   text: "Add Representative",
  //   icon: <AnalyticsRoundedIcon />,
  //   link: "/add-representative",
  // },
  { text: "Bill We Track", icon: <PeopleRoundedIcon />, link: "/bills" },
  { text: "Add Term", icon: <AddIcon/>, link: "/manage-term"},
];

export default function MenuContent() {
  const handleLogout = () => {
    sessionStorage.removeItem("token");
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton 
              component={NavLink} 
              to={item.link}
              sx={{
                '&:hover': {
                  color: '#CC9A3A !important',
                  '& .MuiListItemIcon-root': {
                    color: '#CC9A3A !important'
                  }
                },
                '&.active': {
                  color: '#CC9A3A !important',
                  '& .MuiListItemIcon-root': {
                    color: '#CC9A3A !important'
                  }
                }
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
                '&:hover': {
                  color: '#CC9A3A !important',
                  '& .MuiListItemIcon-root': {
                    color: '#CC9A3A !important'
                  }
                },
                '&.active': {
                  color: '#CC9A3A !important',
                  '& .MuiListItemIcon-root': {
                    color: '#CC9A3A !important'
                  }
                }
              }}
            >
            <ListItemIcon>
              <SettingsRoundedIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Stack>
  );
}
