import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";

export default function CustomizedDataGrid({ type, rows, loading }) {
    const columns = [
        {
            field: "name",
            flex: 1,
            headerName: type === "senator" ? "Senator" : "Representative",
            minWidth: 150,
			display: "flex",
            renderCell: (params) => (
                <div style={{ display: "flex",flexDirection: "row", alignItems: "center", columnGap: "10px" }}>
                    <Avatar src={params.row.photo} />
                    <Typography>{params.row.name}</Typography>
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
        <div style={{ display: "flex", flexDirection: "column"}}>
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                getRowId={(row) => row._id} // Use _id as the unique identifier
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
