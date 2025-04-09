import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Avatar, Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

export default function CustomizedDataGrid({
  type,
  rows,
  loading,
  onEdit,
  onDelete,
}) {
  const getBorderColor = (party) => {
    if (!party) return "gray";
    const lowerParty = party.toLowerCase();
    if (lowerParty === "republican") return "red";
    if (lowerParty === "democrat") return "blue";
    return "gray"; // Default for independent or unknown
  };

  const navigate = useNavigate();

  const columns =
    type === "bills"
      ? [
          { field: "date", flex: 1, headerName: "Date", minWidth: 150 },
          { field: "bill", flex: 3, headerName: "Bill", minWidth: 150 },
          {
            field: "billsType",
            flex: 1,
            headerName: "Type",
            minWidth: 150,
            headerAlign: "center",
            align: "center",
          },
          {
            field: "action",
            flex: 1,
            headerName: "Action",
            minWidth: 60,
            headerAlign: "center",
            renderCell: (params) => (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  height: "100%",
                  alignItems: "center",
                  columnGap: "10px",
                }}
              >
                <EditIcon
                  onClick={() => onEdit(params.row)}
                  sx={{ cursor: "pointer", "&:hover": { color: "blue" } }}
                />
                <DeleteForeverIcon
                  onClick={() => onDelete(params.row)}
                  sx={{ cursor: "pointer", "&:hover": { color: "red" } }}
                />
              </div>
            ),
          },
        ]
      : [
          {
            field: "name",
            flex: 2.5,
            headerName: type === "senator" ? "Senator" : "Representative",
            minWidth: 160,
            minHeight: 200,
            renderCell: (params) => (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  columnGap: "10px",
                  width: "fit-content",
                  height: "100%",
                  "&:hover": {
                    cursor: "pointer",
                  },
                }}
                onClick={() => {
                  if (type == "senator" && params.row._id) {
                    navigate(`edit-senator/${params.row._id}`);
                  } else {
                    navigate(`/edit-representative/${params.row._id}`);
                  }
                }}
              >
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `3px solid ${getBorderColor(params.row.party)}`,
                  }}
                >
                  <Avatar
                    src={params.row.photo}
                    sx={{
                      width: 45,
                      height: 45,
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    transition: "color 0.3s ease-in-out",
                    "&:hover": {
                      color: getBorderColor(params.row.party), // Set hover color based on photo border color
                    },
                  }}
                >
                  {params.row.name}
                </Typography>
              </Box>
            ),
          },
          ...(type === "representative"
            ? [
                {
                  field: "district",
                  flex: 1,
                  headerName: "District",
                  minWidth: 65,
                },
              ]
            : [{ field: "state", flex: 1, headerName: "State", minWidth: 65 }]),
          {
            field: "party",
            flex: 1,
            headerName: "Party",
            headerAlign: "center",
            align: "center",
            minWidth: 65,
            valueGetter: (params) => {
              if (!params) return "N/A";
              return (
                params.charAt(0).toUpperCase() + params.slice(1).toLowerCase()
              );
            },
          },
          {
            field: "rating",
            flex: 1,
            headerName: "Rating",
            minWidth: 50,
            headerAlign: "center",
            align: "center",
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
            minWidth: 60,
            headerAlign: "center",
            renderCell: (params) => (
              <div
                // style={{
                //   height: "100%",
                //   display: "flex",
                //   flexDirection: "row",
                //   alignItems: "center",
                //   // justifyContent: "flex-end", // Adjusted alignment
                //   columnGap: "10px",
                //   // paddingRight: "10px", // Added padding to move slightly from the right
                // }}

                style={{
                  display: "flex",
                  justifyContent: "center",
                  height: "100%",
                  alignItems: "center",
                  columnGap: "10px",
                }}
              >
                <EditIcon
                  onClick={() => onEdit(params.row)}
                  sx={{ cursor: "pointer", "&:hover": { color: "blue" } }}
                />
                <DeleteForeverIcon
                  onClick={() => onDelete(params.row)}
                  sx={{ cursor: "pointer", "&:hover": { color: "red" } }}
                />
              </div>
            ),
          },
        ];

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        // loading={loading}
        getRowId={(row) => row._id}
        initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
        pageSizeOptions={[10, 20, 50]}
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
        disableColumnResize
        disableRowSelectionOnClick
        rowHeight={70}
        sx={{
          "& .MuiDataGrid-row": {
            maxHeight: "70px !important",
            minHeight: "70px !important",
            height: "70px !important",
            alignItems: "center",
            "&:hover": {
              backgroundColor: "transparent",
            },
            "& .MuiDataGrid-cell:focus": {
              outline: "none",
            },
          },
        }}
      />
    </div>
  );
}
