import * as React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
//import { columns, rows } from '../internals/data/gridData';
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";

const rows = [
	{
		id: 1,
		user: {
			username: "Sen.Angela D. Alsobrooks",
			avatar: "https://picsum.photos/200/300",
		},
		state: "Hello",
		party: "World",
		rating: "World",
		action: "World",
	},
	{
		id: 2,
		user: {
			username: "Sen.Angela D. Alsobrooks",
			avatar: "https://picsum.photos/200/300",
		},
		state: "Hello",
		party: "World",
		rating: "World",
		action: "World",
	},
	{
		id: 3,
		user: {
			username: "Sen.Angela D. Alsobrooks",
			avatar: "https://picsum.photos/200/300",
		},
		state: "Hello",
		party: "World",
		rating: "World",
		action: "World",
	},
	{
		id: 4,
		user: {
			username: "Sen.Angela D. Alsobrooks",
			avatar: "https://picsum.photos/200/300",
		},
		state: "Hello",
		party: "World",
		rating: "World",
		action: "World",
	},
];

const columns = [
	{
		field: "user",
		flex: 1,
		headerName: "Senator",
		minWidth: 150,
		display: "flex",
		renderCell: (params) => {
			//console.log(params);
			return (
				<>
					<div style={{ display: "flex", flexDirection: "row", alignItems: "center", columnGap: "10px" }}>
						<Avatar src={params.row.user.avatar} />
						<Typography>{params.row.user.username}</Typography>
					</div>
				</>
			);
		},
	},
	{ field: "state", flex: 1, headerName: "State", minWidth: 150 },
	{ field: "party", flex: 1, headerName: "Party", minWidth: 150 },
	{ field: "rating", flex: 1, headerName: "Rating", minWidth: 150 },
	{
		field: "action",
		flex: 1,
		headerName: "Action",
		minWidth: 150,
    display: "flex",
		renderCell: (params) => {
			//console.log(params);
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
				slots={{ toolbar: GridToolbar, disableRowSelectionOnClick: true }}
				slotProps={{
          
					toolbar: {
						showQuickFilter: true,
					},
				}}
			/>
		</div>
	);
}
