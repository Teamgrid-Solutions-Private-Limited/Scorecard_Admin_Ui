import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";

export default function CustomizedDataGrid({ type, rows, loading, onEdit, onDelete }) {
  const getBorderColor = (party) => {
    if (!party) return "gray";
    const lowerParty = party.toLowerCase();
    if (lowerParty === "republican") return "red";
    if (lowerParty === "democrat") return "blue";
    return "gray"; // Default for independent or unknown
  };

  const columns =
    type === "bills"
      ? [
          { field: "date", flex: 1, headerName: "Date", minWidth: 150 },
          { field: "bill", flex: 2, headerName: "Bill", minWidth: 150 },
          {
            field: "action",
            flex: 1,
            headerName: "Action",
            minWidth: 150,
            headerAlign: "right",
            renderCell: (params) => (
              <div style={{ display: "flex", justifyContent: "flex-end", flexDirection: "row", alignItems: "center", height: "100%", columnGap: "10px" }}>
                <EditIcon onClick={() => onEdit(params.row)} style={{ cursor: "pointer" }} />
                <DeleteForeverIcon onClick={() => onDelete(params.row)} style={{ cursor: "pointer" }} />
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
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", columnGap: "10px", padding: "5px 0" }}>
                <Avatar
                  src={params.row.photo}
                  sx={{
                    width: 40,
                    height: 40,
                    border: `3px solid ${getBorderColor(params.row.party)}`,
                  }}
                />
                <Typography>{params.row.name}</Typography>
              </div>
            ),
          },
          ...(type === "representative"
            ? [{ field: "district", flex: 1, headerName: "District", minWidth: 150 }]
            : [{ field: "state", flex: 1, headerName: "State", minWidth: 150 }]),
          {
            field: "party",
            flex: 1,
            headerName: "Party",
            minWidth: 150,
            valueGetter: (params) => {
              if (!params) return "N/A";
              return params.charAt(0).toUpperCase() + params.slice(1).toLowerCase();
            },
          },
          {
            field: "rating",
            flex: 2,
            headerName: "Rating",
            minWidth: 150,
            valueGetter: (params) => {
              if (!params || !params.row) {
                return "N/A";
              }
              return params.row.rating || "N/A";
            },
          },
          {
            field: "action",
            flex: 1,
            headerName: "Action",
            minWidth: 120,
            renderCell: (params) => (
<<<<<<< HEAD
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
                style={{
                  cursor: "pointer",
                  marginTop: "5px",
                  transition: "0.3s ease-in-out",
                  color: "#1976d2", // Default blue color
                }}
                onMouseOver={(e) => (e.target.style.color = "#1565c0")} // Darker blue on hover
                onMouseOut={(e) => (e.target.style.color = "#1976d2")}
              />
              <DeleteForeverIcon
                onClick={() => onDelete(params.row)}
                style={{
                  cursor: "pointer",
                  marginTop: "5px",
                  transition: "0.3s ease-in-out",
                  color: "#d32f2f", // Default red color
                }}
                onMouseOver={(e) => (e.target.style.color = "#b71c1c")} // Darker red on hover
                onMouseOut={(e) => (e.target.style.color = "#d32f2f")}
              />
            </div>            
=======
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", columnGap: "10px" }}>
                <EditIcon onClick={() => onEdit(params.row)} style={{ cursor: "pointer", marginTop:"12px" }} />
                <DeleteForeverIcon onClick={() => onDelete(params.row)} style={{ cursor: "pointer", marginTop:"12px" }} />
              </div>
>>>>>>> development
            ),
          },
        ];

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row._id}
        initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
        pageSizeOptions={[10, 20, 50]}
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
        disableColumnResize
        disableRowSelectionOnClick
        sx={{ '& .MuiDataGrid-row': { height: 90, alignItems: "center" } }}
      />
    </div>
  );
}