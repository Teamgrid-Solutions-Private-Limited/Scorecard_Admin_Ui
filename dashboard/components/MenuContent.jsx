import * as React from 'react';
import { NavLink } from 'react-router-dom'; // Import NavLink for navigation
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

const mainListItems = [
  { text: 'Senate', icon: <HomeRoundedIcon />, link: '/' },
  { text: 'Add Senator', icon: <HomeRoundedIcon />, link: '/add-senator' },
  { text: 'Representative', icon: <AnalyticsRoundedIcon />, link: '/representative' },
  { text: 'Add Representative', icon: <AnalyticsRoundedIcon />, link: '/add-representative' },
  { text: 'Bill We Track', icon: <PeopleRoundedIcon />, link: '/bills' },
  // { text: 'Activity', icon: <AssignmentRoundedIcon />, link: '/activity' },
];

const secondaryListItems = [
  { text: 'Logout', icon: <SettingsRoundedIcon />, link: '/logout' },
];

export default function MenuContent() {
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton component={NavLink} to={item.link}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton component={NavLink} to={item.link}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
