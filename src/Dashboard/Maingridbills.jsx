import * as React from "react";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Copyright from "./internals/components/Copyright";  // Adjust this path based on your project structure
import CustomizedDataGrid from "./Datagridbills";  // Changed to match the actual file name

export default function MainGrid() {
	return (
		<Box sx={{ width: "100%" }}>
			<Typography component="h2" variant="h6" sx={{ mb: 2 }}>
				All Senators
			</Typography>
			<Grid container spacing={2} columns={12}>
				<Grid size={{ xs: 12, lg: 12 }}>
					<CustomizedDataGrid />
				</Grid>
			</Grid>
			<Copyright sx={{ my: 4 }} />
		</Box>
	);
}
