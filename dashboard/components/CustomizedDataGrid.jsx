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
	{
		id: 5,
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
		"id": 6,
		"user": {
		  "username": "Sen. Michael Johnson",
		  "avatar": "https://randomuser.me/api/portraits/men/6.jpg"
		},
		"state": "Ohio",
		"party": "Democratic",
		"rating": "A-",
		"action": "Active"
	  },
	  {
		"id": 7,
		"user": {
		  "username": "Sen. Sophia Martinez",
		  "avatar": "https://randomuser.me/api/portraits/women/7.jpg"
		},
		"state": "Nevada",
		"party": "Independent",
		"rating": "B+",
		"action": "Active"
	  },
	  {
		"id": 8,
		"user": {
		  "username": "Sen. Daniel Wilson",
		  "avatar": "https://randomuser.me/api/portraits/men/8.jpg"
		},
		"state": "Georgia",
		"party": "Republican",
		"rating": "B",
		"action": "Inactive"
	  },
	  {
		"id": 9,
		"user": {
		  "username": "Sen. Olivia White",
		  "avatar": "https://randomuser.me/api/portraits/women/9.jpg"
		},
		"state": "Michigan",
		"party": "Democratic",
		"rating": "A+",
		"action": "Active"
	  },
	  {
		"id": 10,
		"user": {
		  "username": "Sen. Ethan Thomas",
		  "avatar": "https://randomuser.me/api/portraits/men/10.jpg"
		},
		"state": "North Carolina",
		"party": "Republican",
		"rating": "C",
		"action": "Inactive"
	  },
	  {
		"id": 11,
		"user": {
		  "username": "Sen. Isabella Harris",
		  "avatar": "https://randomuser.me/api/portraits/women/11.jpg"
		},
		"state": "Arizona",
		"party": "Democratic",
		"rating": "A-",
		"action": "Active"
	  },
	  {
		"id": 12,
		"user": {
		  "username": "Sen. William Carter",
		  "avatar": "https://randomuser.me/api/portraits/men/12.jpg"
		},
		"state": "Washington",
		"party": "Independent",
		"rating": "B",
		"action": "Active"
	  },
	  {
		"id": 13,
		"user": {
		  "username": "Sen. Charlotte Lewis",
		  "avatar": "https://randomuser.me/api/portraits/women/13.jpg"
		},
		"state": "Colorado",
		"party": "Republican",
		"rating": "B-",
		"action": "Inactive"
	  },
	  {
		"id": 14,
		"user": {
		  "username": "Sen. Henry Walker",
		  "avatar": "https://randomuser.me/api/portraits/men/14.jpg"
		},
		"state": "Illinois",
		"party": "Democratic",
		"rating": "A",
		"action": "Active"
	  },
	  {
		"id": 15,
		"user": {
		  "username": "Sen. Amelia Robinson",
		  "avatar": "https://randomuser.me/api/portraits/women/15.jpg"
		},
		"state": "Pennsylvania",
		"party": "Independent",
		"rating": "A+",
		"action": "Active"
	  },
	  {
		"id": 16,
		"user": {
		  "username": "Sen. Benjamin Scott",
		  "avatar": "https://randomuser.me/api/portraits/men/16.jpg"
		},
		"state": "Virginia",
		"party": "Democratic",
		"rating": "A",
		"action": "Active"
	  },
	  {
		"id": 17,
		"user": {
		  "username": "Sen. Natalie Reed",
		  "avatar": "https://randomuser.me/api/portraits/women/17.jpg"
		},
		"state": "New Jersey",
		"party": "Republican",
		"rating": "B+",
		"action": "Inactive"
	  },
	  {
		"id": 18,
		"user": {
		  "username": "Sen. Christopher Adams",
		  "avatar": "https://randomuser.me/api/portraits/men/18.jpg"
		},
		"state": "Minnesota",
		"party": "Independent",
		"rating": "A-",
		"action": "Active"
	  },
	  {
		"id": 19,
		"user": {
		  "username": "Sen. Victoria Allen",
		  "avatar": "https://randomuser.me/api/portraits/women/19.jpg"
		},
		"state": "Oregon",
		"party": "Democratic",
		"rating": "B",
		"action": "Active"
	  },
	  {
		"id": 20,
		"user": {
		  "username": "Sen. Jonathan Perez",
		  "avatar": "https://randomuser.me/api/portraits/men/20.jpg"
		},
		"state": "Tennessee",
		"party": "Republican",
		"rating": "C+",
		"action": "Inactive"
	  },
	  {
		"id": 21,
		"user": {
		  "username": "Sen. Hannah Lewis",
		  "avatar": "https://randomuser.me/api/portraits/women/21.jpg"
		},
		"state": "Indiana",
		"party": "Independent",
		"rating": "A",
		"action": "Active"
	  },
	  {
		"id": 22,
		"user": {
		  "username": "Sen. Daniel Foster",
		  "avatar": "https://randomuser.me/api/portraits/men/22.jpg"
		},
		"state": "Missouri",
		"party": "Democratic",
		"rating": "B+",
		"action": "Active"
	  },
	  {
		"id": 23,
		"user": {
		  "username": "Sen. Sophia Ramirez",
		  "avatar": "https://randomuser.me/api/portraits/women/23.jpg"
		},
		"state": "Wisconsin",
		"party": "Republican",
		"rating": "B-",
		"action": "Inactive"
	  },
	  {
		"id": 24,
		"user": {
		  "username": "Sen. Oliver Carter",
		  "avatar": "https://randomuser.me/api/portraits/men/24.jpg"
		},
		"state": "Louisiana",
		"party": "Democratic",
		"rating": "A-",
		"action": "Active"
	  },
	  {
		"id": 25,
		"user": {
		  "username": "Sen. Isabella Turner",
		  "avatar": "https://randomuser.me/api/portraits/women/25.jpg"
		},
		"state": "Kentucky",
		"party": "Independent",
		"rating": "A+",
		"action": "Active"
	  }
	
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
