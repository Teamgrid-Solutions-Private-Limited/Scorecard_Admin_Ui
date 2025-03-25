import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";

export default function CustomizedDataGrid({ type }) {
    // Example data for senators and representatives
    const data = {
        senator: [
            {
                id: 1,
                user: {
                    username: "Sen.Angela D. Alsobrooks",
                    avatar: "https://picsum.photos/200/300",
                },
                state: "Maryland",
                party: "Democrat",
                rating: "A",
               
            },
        ],
        representative: [
            {
                id: 1,
                user: {
                    username: "Rep.John Doe",
                    avatar: "https://picsum.photos/200/300",
                },
                state: "California",
                party: "Republican",
                rating: "B",
              
            },
        ],
    };

    const rows = data[type] || [];

    const columns = [
        ...(type === "bills"
            ? [
                  {
                      field: "date",
                      flex: 1,
                      headerName: "Date",
                      minWidth: 150,
                      renderCell: (params) => (
                          <Typography>
                              {new Date(params.row.date).toLocaleDateString()}
                          </Typography>
                      ),
                  },
              ]
            : []),
        {
            field: "user",
            flex: 1,
            headerName: type === "senator" ? "Senator" : "Representative",
            minWidth: 150,
            renderCell: (params) => (
                <div style={{ display: "flex", alignItems: "center", columnGap: "10px" }}>
                    <Avatar src={params.row.user.avatar} />
                    <Typography>{params.row.user.username}</Typography>
                </div>
            ),
        },
        { field: "state", flex: 1, headerName: "State", minWidth: 150 },
        { field: "party", flex: 1, headerName: "Party", minWidth: 150 },
        {
            field: "action",
            flex: 1,
            headerName: "Action",
            minWidth: 150,
            renderCell: () => (
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", columnGap: "10px" }}>
                    <EditIcon />
                    <DeleteForeverIcon />
                </div>
            ),
        },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <DataGrid
                rows={rows}
                columns={columns}
                initialState={{
                    pagination: { paginationModel: { pageSize: 20 } },
                }}
                pageSizeOptions={[10, 20, 50]}
                disableColumnFilter
                disableColumnSelector
                disableDensitySelector
                disableColumnResize
                disableRowSelectionOnClick
            />
        </div>
    );
}
