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
import logo from "../../src/assets/image/logo-dark.png";
import logosm from "../../src/assets/image/logo-sm.png";


const drawerWidth = 240;

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
					backgroundColor: "background.paper",
					'& .MuiListItemButton-root:hover': {
						color: '#CC9A3A !important',
						'& .MuiListItemIcon-root': {
							color: '#CC9A3A !important'
						}
					},
					'& .MuiListItemButton-root.active': {
						color: '#CC9A3A !important',
						'& .MuiListItemIcon-root': {
							color: '#CC9A3A !important'
						}
					}
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
				<img className="logo-sm" src={logosm} />
				<img className="logo-lg" src={logo} />

			</Stack>

			<Divider />
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
