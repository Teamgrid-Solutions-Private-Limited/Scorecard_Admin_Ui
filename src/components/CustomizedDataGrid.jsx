import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Avatar, Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { GridOverlay } from "@mui/x-data-grid";
import { getAllSenatorData } from "../redux/reducer/senetorTermSlice";
import { getAllHouseData } from "../redux/reducer/houseTermSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const CustomNoRowsOverlay = () => (
  <GridOverlay>
    <Typography variant="body1" sx={{ color: "gray", mt: 2 }}>
      Sorry, nothing matched your search term.
    </Typography>
  </GridOverlay>
);

export default function CustomizedDataGrid({
  type,
  rows,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  handleToggleStatusAct,
  isSelectable = false,
  onSelectionChange,
  selectedItems = [],
  handleToggleStatusSenator,
  handleToggleStatusHouse,
}) {
  const dispatch = useDispatch();
  const { senatorData } = useSelector((state) => state.senatorData);
  const { houseData } = useSelector((state) => state.houseData);
  const [mergedRows, setMergedRows] = useState([]);

  useEffect(() => {
    dispatch(getAllSenatorData());
    dispatch(getAllHouseData());
  }, [dispatch]);

  useEffect(() => {
    if (rows) {
      if (type === "senator" && senatorData) {
        const merged = rows.map((row) => {
          const match = senatorData.find((data) => data.senateId === row._id);
          return {
            ...row,
            rating: match?.rating || "N/A",
          };
        });
        setMergedRows(merged);
      } else if (type === "representative" && houseData) {
        const merged = rows.map((row) => {
          const match = houseData.find((data) => data.houseId === row._id);
          return {
            ...row,
            rating: match?.rating || "N/A",
          };
        });
        setMergedRows(merged);
      } else {
        // For bills/activities or if data isn't loaded yet
        setMergedRows(
          rows.map((row) => ({
            ...row,
            rating: row.rating || "N/A",
          }))
        );
      }
    }
  }, [rows, senatorData, houseData, type]);

  const getBorderColor = (party) => {
    if (!party) return "gray";
    const lowerParty = party.toLowerCase();
    if (lowerParty === "republican") return "red";
    if (lowerParty === "democrat") return "blue";
    return "gray";
  };

  const navigate = useNavigate();

  const columns =
    type === "bills"
      ? [
          {
            field: "date",
            flex: 1,
            headerName: "Date",
            minWidth: 150,
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),
          },
          {
            field: "bill",
            flex: 3,
            headerName: "Bill",
            minWidth: 150,
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),
          },
          {
            field: "billsType",
            flex: 1,
            headerName: "Type",
            minWidth: 150,
            headerAlign: "center",
            align: "center",
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),
          },
          {
            field: "status",
            headerName: "Status",
            flex: 1,
            minWidth: 130,
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),
            renderCell: (params) => {
              const status = params?.row?.status;
              const displayStatus = status
                ? status.charAt(0).toUpperCase() + status.slice(1)
                : "N/A";

              return (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Typography>{displayStatus}</Typography>
                </Box>
              );
            },
          },
          {
            field: "action",
            flex: 1,
            headerName: "Action",
            minWidth: 60,
            headerAlign: "center",
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),
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
      : type === "activities"
      ? [
          {
            field: "date",
            flex: 1,
            headerName: "Date",
            minWidth: 150,
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),
          },
          {
            field: "activity",
            flex: 3,
            headerName: "Title",
            minWidth: 150,
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),
          },
          {
            field: "activityType",
            flex: 1,
            headerName: "Type",
            minWidth: 150,
            headerAlign: "center",
            align: "center",
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),
          },
          {
            field: "status",
            headerName: "Status",
            flex: 1,
            minWidth: 130,
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),
            renderCell: (params) => {
              const status = params?.row?.status;
              const capitalized = status
                ? status.charAt(0).toUpperCase() + status.slice(1)
                : "N/A";

              return (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%", // Ensures it fills the row's height
                  }}
                >
                  <Typography>{capitalized}</Typography>
                </Box>
              );
            },
          },

          {
            field: "action",
            flex: 1,
            headerName: "Action",
            minWidth: 60,
            headerAlign: "right",
            align: "right",
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold", paddingRight: "32px" }}>
                {params.colDef.headerName}
              </Typography>
            ),
            renderCell: (params) => (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  height: "100%",
                  alignItems: "center",
                  paddingRight: "32px",
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
      : type === "user"
      ? [
          {
            field: "fullName",
            flex: 2,
            headerName: "Name",
            minWidth: 150,
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),
          },
          {
            field: "nickName",
            flex: 1,
            headerName: "Nick Name",
            minWidth: 120,
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),
          },
          {
            field: "email",
            flex: 2,
            headerName: "Email",
            minWidth: 180,
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),
          },
          {
            field: "role",
            flex: 1,
            headerName: "Role",
            minWidth: 100,
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),
            valueGetter: (params) =>
              params ? params.charAt(0).toUpperCase() + params.slice(1) : "",
          },
          {
            field: "action",
            flex: 1,
            headerName: "Action",
            minWidth: 100,
            headerAlign: "right",
            align: "right",
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),
            renderCell: (params) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  columnGap: "10px",
                  height: "100%",
                  paddingRight: "16px",
                }}
              >
                <EditIcon
                  onClick={() => onEdit && onEdit(params.row)}
                  sx={{ cursor: "pointer", "&:hover": { color: "blue" } }}
                />
                <DeleteForeverIcon
                  onClick={() => onDelete && onDelete(params.row._id)}
                  sx={{ cursor: "pointer", "&:hover": { color: "red" } }}
                />
              </div>
            ),
          },
        ]
      : [
          {
            field: "name",
            flex: 2,
            headerName: type === "senator" ? "Senator" : "Representative",
            minWidth: 150,
            minHeight: 200,
            headerAlign: "left",
            align: "left",
            renderHeader: (params) => (
              <Typography
                sx={{
                  paddingLeft: "32px",
                  fontWeight: "bold",
                }}
              >
                {params.colDef.headerName}
              </Typography>
            ),
            renderCell: (params) => (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  columnGap: "10px",
                  width: "fit-content",
                  height: "100%",
                  paddingLeft: "32px",
                  "&:hover": {
                    cursor: "pointer",
                  },
                }}
                onClick={() => {
                  if (type === "senator" && params.row._id) {
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
                    border: `2px solid ${getBorderColor(params.row.party)}`,
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
                      color: getBorderColor(params.row.party),
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
                  minWidth: 120,
                  renderHeader: (params) => (
                    <Typography
                      sx={{ fontWeight: "bold", fontSize: "0.875rem" }}
                    >
                      {params.colDef.headerName}
                    </Typography>
                  ),
                },
              ]
            : [
                {
                  field: "state",
                  flex: 1,
                  headerName: "State",
                  minWidth: 120,
                  renderHeader: (params) => (
                    <Typography
                      sx={{ fontWeight: "bold", fontSize: "0.875rem" }}
                    >
                      {params.colDef.headerName}
                    </Typography>
                  ),
                },
              ]),
          {
            field: "party",
            flex: 1,
            headerName: "Party",
            minWidth: 120,
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                {params.colDef.headerName}
              </Typography>
            ),
            valueGetter: (params) => {
              if (!params) return "N/A";
              return (
                params.charAt(0).toUpperCase() + params.slice(1).toLowerCase()
              );
            },
          },
          {
            field: "rating",
            flex: 0.7,
            headerName: "Rating",
            minHeight: 200,
            minWidth: 130,
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                {params.colDef.headerName}
              </Typography>
            ),
            valueGetter: (params) => {
              return params || "N/A";
            },
          },
          ...(type === "representative"
            ? [
                {
                  field: "publishStatus",
                  headerName: "Status",
                  flex: 1,
                  minWidth: 130,
                  renderHeader: (params) => (
                    <Typography sx={{ fontWeight: "bold" }}>
                      {params.colDef.headerName}
                    </Typography>
                  ),
                  renderCell: (params) => {
                    const status = params?.row?.publishStatus;

                    const displayStatus = status
                      ? status.charAt(0).toUpperCase() + status.slice(1)
                      : "N/A";

                    return (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        <Typography>{displayStatus}</Typography>
                      </Box>
                    );
                  },
                },
              ]
            : [
                {
                  field: "publishStatus",
                  headerName: "Status",
                  flex: 1,
                  minWidth: 130,
                  renderHeader: (params) => (
                    <Typography sx={{ fontWeight: "bold" }}>
                      {params.colDef.headerName}
                    </Typography>
                  ),
                  renderCell: (params) => {
                    const status = params?.row?.publishStatus;
                    const displayStatus = status
                      ? status.charAt(0).toUpperCase() + status.slice(1)
                      : "N/A";

                    return (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        <Typography>{displayStatus}</Typography>
                      </Box>
                    );
                  },
                },
              ]),

          {
            field: "action",
            flex: 0.7,
            headerName: "Action",
            minWidth: 130,
            headerAlign: "right",
            align: "right",
            renderHeader: (params) => (
              <Typography sx={{ paddingRight: "32px", fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),
            renderCell: (params) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  columnGap: "10px",
                  height: "100%",
                  paddingRight: "32px",
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
        rows={mergedRows}
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
        rowHeight={70}
        slots={{
          noRowsOverlay: CustomNoRowsOverlay,
        }}
        checkboxSelection={isSelectable}
        onRowSelectionModelChange={isSelectable ? (ids) => onSelectionChange && onSelectionChange(ids) : undefined}
        selectionModel={isSelectable ? selectedItems : []}
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
