import * as React from "react";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SelectContent from "./SelectContent";
import MenuContent from "./MenuContent";
import CardAlert from "./CardAlert";
import OptionsMenu from "./OptionsMenu";
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
  color: "#FFFFFF !important", // sab text white
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
					borderTop: "1px solid",
					borderColor: "divider",
				}}
			>
				
				<img className="logo-lg" src={logo} style={{ width: "140px", height: "auto" }}  />

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
				{/* <CardAlert /> */}
			</Box>
		</Drawer>
	);
}
