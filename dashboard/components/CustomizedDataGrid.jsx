import * as React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { useDispatch } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { deleteSenator } from "../../redux/slice/senetorSlice"; // Import the delete action

export default function CustomizedDataGrid({ type, rows, loading }) {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Initialize useNavigate

    const handleDelete = (row) => {
        if (window.confirm(`Are you sure you want to delete ${row.name}?`)) {
            dispatch(deleteSenator(row._id)); // Dispatch the delete action with the senator's ID
        }
    };

    const handleEdit = (row) => {
        navigate(`/edit-senator/${row._id}`); // Navigate to the edit page with the senator's ID
    };

    const columns = type === "bills"
        ? [
            { field: "date", flex: 1, headerName: "Date", minWidth: 150 },
            { field: "bill", flex: 1, headerName: "Bill", minWidth: 150 },
            {
                field: "action",
                flex: 1,
                headerName: "Action",
                minWidth: 150,
                renderCell: (params) => (
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", columnGap: "10px" }}>
                        <EditIcon onClick={() => handleEdit(params.row)} style={{ cursor: "pointer" }} />
                        <DeleteForeverIcon onClick={() => handleDelete(params.row)} style={{ cursor: "pointer" }} />
                    </div>
                ),
            },
        ]
        : [
            {
                field: "name",
                flex: 1,
                headerName: type === "senator" ? "Senator" : "Representative",
                minWidth: 150,
                renderCell: (params) => (
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", columnGap: "10px" }}>
                        <Avatar src={params.row.photo} />
                        <Typography>{params.row.name}</Typography>
                    </div>
                ),
            },
            ...(type === "representative"
                ? [{ field: "district", flex: 1, headerName: "District", minWidth: 150 }]
                : [{ field: "state", flex: 1, headerName: "State", minWidth: 150 }]
            ),
            { field: "party", flex: 1, headerName: "Party", minWidth: 150 },
            {
                field: "rating",
                flex: 1,
                headerName: "Rating",
                minWidth: 150,
                valueGetter: (params) => {
                    if (!params || !params.row) {
                        return "N/A"; // Return "N/A" if params or params.row is undefined
                    }
                    return params.row.rating || "N/A"; // Return "rating" or "N/A" if rating is not provided
                },
            },
            {
                field: "action",
                flex: 1,
                headerName: "Action",
                minWidth: 150,
                renderCell: (params) => (
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", columnGap: "10px" }}>
                        <EditIcon onClick={() => handleEdit(params.row)} style={{ cursor: "pointer" }} />
                        <DeleteForeverIcon onClick={() => handleDelete(params.row)} style={{ cursor: "pointer" }} />
                    </div>
                ),
            },
        ];

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                getRowId={(row) => row._id} // Use `_id` as the unique identifier
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
