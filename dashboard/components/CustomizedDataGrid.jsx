import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
 
export default function CustomizedDataGrid({
  type,
  rows,
  loading,
  onEdit,
  onDelete,
}) {
  const columns =
    type === "bills"
      ? [
          { field: "date", flex: 1, headerName: "Date", minWidth: 150 },
          { field: "bill", flex: 1, headerName: "Bill", minWidth: 150 },
          {
            field: "action",
            flex: 1,
            headerName: "Action",
            minWidth: 150,
            renderCell: (params) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  columnGap: "10px",
                }}
              >
                <EditIcon
                  onClick={() => onEdit(params.row)}
                  style={{ cursor: "pointer" }}
                />
                <DeleteForeverIcon
                  onClick={() => onDelete(params.row)}
                  style={{ cursor: "pointer" }}
                />
              </div>
            ),
          },
        ]
      : [
          {
            field: "name",
            flex: 3,
            headerName: type === "senator" ? "Senator" : "Representative",
            minWidth: 150,
            renderCell: (params) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  columnGap: "10px",
                }}
              >
                <Avatar src={params.row.photo} sx={{ mt: 0.7 }} />
                <Typography sx={{ mt: 0.7 }}>{params.row.name}</Typography>
              </div>
            ),
          },
          ...(type === "representative"
            ? [
                {
                  field: "district",
                  flex: 1,
                  headerName: "District",
                  minWidth: 150,
                },
              ]
            : [
                { field: "state", flex: 1, headerName: "State", minWidth: 150 },
              ]),
          { field: "party", flex: 1, headerName: "Party", minWidth: 150 },
          {
            field: "rating",
            flex: 2,
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
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  columnGap: "10px",
                  marginTop: "8px",
                }}
              >
                <EditIcon
                  onClick={() => onEdit(params.row)}
                  style={{ cursor: "pointer", marginTop: "5px" }}
                />
                <DeleteForeverIcon
                  onClick={() => onDelete(params.row)}
                  style={{ cursor: "pointer", marginTop: "5px" }}
                />
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
        getRowId={(row) => row._id} // Use `id` as the unique identifier
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
 