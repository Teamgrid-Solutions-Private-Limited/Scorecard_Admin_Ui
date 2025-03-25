import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Typography from "@mui/material/Typography";

const rows = [
	{
		id: 1,
		date: "2024-01-15",
		party: "World",
		action: "World",
	},
	{
		id: 2,
		date: "2024-01-16",
		party: "World",
		action: "World",
	},
	{
		id: 3,
		date: "2024-01-17",
		party: "World",
		action: "World",
	},
	{
		id: 4,
		date: "2024-01-18",
		party: "World",
		action: "World",
	},
];

const columns = [
	{
		field: "date",
		flex: 1,
		headerName: "Date",
		minWidth: 150,
		renderCell: (params) => {
			return (
				<Typography>
					{new Date(params.value).toLocaleDateString()}
				</Typography>
			);
		},
	},
	{ field: "party", flex: 1, headerName: "Bill Name", minWidth: 150 },
	{
		field: "action",
		flex: 1,
		headerName: "Action",
		minWidth: 150,
		display: "flex",
		renderCell: (params) => {
			return (
				<>
					<div style={{ display: "flex", flexDirection: "row", alignItems: "center", columnGap: "10px" }}>
						<EditIcon />
						<DeleteForeverIcon />
					</div>
				</>
			);
		},
	},
];

export default function CustomizedDataGrid() {
	return (
		<div style={{ display: "flex", flexDirection: "column" }}>
			<DataGrid
				disableColumnFilter
				disableColumnSelector
				disableDensitySelector
				rows={rows}
				columns={columns}
				initialState={{
					pagination: { paginationModel: { pageSize: 20 } },
				}}
				pageSizeOptions={[10, 20, 50]}
				disableColumnResize
				disableRowSelectionOnClick={true}
			/>
		</div>
	);
}
