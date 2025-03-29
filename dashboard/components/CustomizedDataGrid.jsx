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
          { field: "bill", flex: 2, headerName: "Bill", minWidth: 150 },
          {
            field: "action",
            flex: 1,
            headerName: "Action",
            minWidth: 150,
            headerAlign: "right",
            renderCell: (params) => (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  flexDirection: "row",
                  alignItems: "center",
                  height: "100%",
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
            flex: 3,
            headerName: type === "senator" ? "Senator" : "Representative",
            minWidth: 150,
            renderCell: (params) => (
              <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                columnGap: "10px",
                padding: "5px 0",
                width: "fit-content",
                "&:hover": {
                  cursor: "pointer",
                  
                },
              }}
                onClick={()=>{
                  if(type=="senator" && params.row._id){
                    navigate(`edit-senator/${params.row._id}`)
                  }else{
                    navigate(`/edit-representative/${params.row._id}`)
                  }
                }}
              >
                <Box
                  sx={{
                    width: 39, 
                    height: 39,
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
                      width: 35, 
                      height: 35,
                    }}
                  />
                </Box>
                <Typography>{params.row.name}</Typography>
              </Box>
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
          {
            field: "party",
            flex: 1,
            headerName: "Party",
            minWidth: 150,
            valueGetter: (params) => {
              if (!params) return "N/A";
              return (
                params.charAt(0).toUpperCase() + params.slice(1).toLowerCase()
              );
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
              <div
                style={{
                  height:"100%",
                  display: "flex",
                  flexDirection: "row",
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
        sx={{ "& .MuiDataGrid-row": { height: 90, alignItems: "center" } }}
      />
    </div>
  );
}
