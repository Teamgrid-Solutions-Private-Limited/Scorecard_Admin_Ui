import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Avatar, Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { GridOverlay } from "@mui/x-data-grid";
import { getAllSenatorData } from "../redux/reducer/senatorTermSlice";
import { getAllHouseData } from "../redux/reducer/houseTermSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme, useMediaQuery, Chip } from "@mui/material";
import { getAllTerms } from "../redux/reducer/termSlice";
import { get } from "lodash";
import { API_URL } from "../redux/API";
import { getToken, getUserRole } from "../utils/auth";
import { getItem, setItem, STORAGE_KEYS } from "../utils/storage";
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
  isSelectable = false,
  onSelectionChange,
  selectedItems = [],
}) {
  const dispatch = useDispatch();
  const { senatorData } = useSelector((state) => state.senatorData);
  const { houseData } = useSelector((state) => state.houseData);
  const [mergedRows, setMergedRows] = useState([]);
  const token = getToken();
  const userRole = getUserRole();
  const { terms } = useSelector((state) => state.term);

  useEffect(() => {
    dispatch(getAllSenatorData());
    dispatch(getAllHouseData());
    dispatch(getAllTerms());
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
          const houseRecords = houseData.filter(
            (data) => data.houseId === row._id
          );

          const currentTermData = houseRecords.find(
            (rec) => rec.currentTerm === true
          );
          let rating = "N/A";
          let termId = row.termId;
          let termName = "";
          let currentTerm = false;

          if (currentTermData) {
            termId = currentTermData.termId;
            rating = currentTermData.rating || "N/A";
            currentTerm = true;
            if (!currentTermData.rating) {
              const fallbackRecords = houseRecords
                .map((rec) => {
                  const termObj = terms.find((t) => t._id === rec.termId);
                  return termObj ? { ...rec, termObj } : null;
                })
                .filter(Boolean)
                .sort((a, b) => {
                  const aYear = parseInt(a.termObj.endYear, 10) || 0;
                  const bYear = parseInt(b.termObj.endYear, 10) || 0;
                  return bYear - aYear;
                });

              const valid = fallbackRecords.find(
                (rec) => rec.rating && rec.rating !== ""
              );
              if (valid) {
                rating = valid.rating;
                termId = valid.termId;
                termName = valid.termObj.name;
              }
            } else {
              const termObj = terms.find((t) => t._id === termId);
              termName = termObj ? termObj.name : "";
            }
          } else {
            const validRecords = houseRecords
              .map((rec) => {
                const termObj = terms.find((t) => t._id === rec.termId);
                return termObj ? { ...rec, termObj } : null;
              })
              .filter(Boolean)
              .sort((a, b) => {
                const aYear = parseInt(a.termObj.endYear, 10) || 0;
                const bYear = parseInt(b.termObj.endYear, 10) || 0;
                return bYear - aYear;
              });

            if (validRecords.length > 0) {
              const latest = validRecords.find(
                (rec) => rec.rating && rec.rating !== ""
              );
              if (latest) {
                rating = latest.rating;
                termId = latest.termId;
                termName = latest.termObj.name;
              }
            } else {
              const termObj = terms.find((t) => t._id === row.termId);
              termName = termObj ? termObj.name : "";
            }
          }

          return {
            ...row,
            rating,
            termId,
            termName,
            currentTerm,
          };
        });

        setMergedRows(merged);
      } else {
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
  const getStatusColor = (status) => {
    if (!status) return "default";

    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes("published")) return "success";
    if (lowerStatus.includes("draft")) return "default";
    if (lowerStatus.includes("review")) return "warning";

    return "default";
  };

  const navigate = useNavigate();

  // Map type to storage key constant
  const getPaginationStorageKey = (type) => {
    const keyMap = {
      senator: STORAGE_KEYS.PAGINATION_SENATOR,
      representative: STORAGE_KEYS.PAGINATION_REPRESENTATIVE,
      activities: STORAGE_KEYS.PAGINATION_ACTIVITIES,
      bills: STORAGE_KEYS.PAGINATION_BILLS,
    };
    return keyMap[type] || `dataGridPagination_${type}`;
  };

  const storageKey = getPaginationStorageKey(type);
  const [paginationModel, setPaginationModel] = useState(() => {
    const saved = getItem(storageKey);
    return saved || { page: 0, pageSize: 20 };
  });

  useEffect(() => {
    setItem(storageKey, paginationModel);
  }, [paginationModel, storageKey]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const columns =
    type === "votes"
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
            field: "vote",
            flex: 3,
            headerName: "Vote",
            minWidth: 150,
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),
            renderCell: (params) => (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  height: "100%",
                  columnGap: "10px",
                  "&:hover": {
                    cursor: "pointer",
                  },
                }}
                onClick={() => onEdit(params.row)}
              >
                <Typography
                  sx={{
                    transition: "color 0.3s ease-in-out",
                    "&:hover": {
                      color: "primary.main",
                    },
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {params.row.vote}
                </Typography>
              </Box>
            ),
          },

          {
            field: "VotesType",
            flex: 2,
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
            field: "congress",
            flex: 1,
            headerName: "Congress",
            minWidth: 160,
            renderHeader: (params) => (
              <Typography
                sx={{ fontWeight: "bold", textAlign: "center", width: "100%" }}
              >
                {params.colDef.headerName}
              </Typography>
            ),
            renderCell: (params) => (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "left",
                  alignItems: "center",
                  pl: 3,
                  width: "100%",
                  height: "100%",
                  textAlign: "center",
                }}
              >
                <Typography>{params.value}</Typography>
              </Box>
            ),
          },
          
          {
            field: "status",
            headerName: "Status",
            flex: 1,
            minWidth: 140,
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),

            renderCell: (params) => {
              const status = params?.row?.status;
              const displayStatus = status
                ? status
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")
                : "N/A";

              return (
                <Chip
                  label={displayStatus}
                  color={getStatusColor(status)}
                  variant="outlined"
                  size="small"
                />
              );
            },
          },
          {
            field: "action",
            flex: 1,
            headerName: "Action",
            minWidth: 140,
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
                {userRole === "admin" && (
                  <DeleteForeverIcon
                    onClick={() => onDelete(params.row)}
                    sx={{ cursor: "pointer", "&:hover": { color: "red" } }}
                  />
                )}
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
            renderCell: (params) => (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  height: "100%",
                  columnGap: "10px",
                  "&:hover": {
                    cursor: "pointer",
                  },
                }}
                onClick={() => onEdit(params.row)}
              >
                <Typography
                  sx={{
                    transition: "color 0.3s ease-in-out",
                    "&:hover": {
                      color: "primary.main",
                    },
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {params.row.activity}
                </Typography>
              </Box>
            ),
          },
          {
            field: "activityType",
            flex: 2,
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
            minWidth: 140,
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),
            renderCell: (params) => {
              const status = params?.row?.status;
              const displayStatus = status
                ? status
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")
                : "N/A";

              return (
                <Chip
                  label={displayStatus}
                  color={getStatusColor(status)}
                  variant="outlined"
                  size="small"
                />
              );

              return (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
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
            minWidth: 140,
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
                {userRole === "admin" && (
                  <DeleteForeverIcon
                    onClick={() => onDelete(params.row)}
                    sx={{ cursor: "pointer", "&:hover": { color: "red" } }}
                  />
                )}
              </div>
            ),
          },
        ]
      : type === "user"
      ? [
          {
            field: "fullName",
            flex: 1.5,
            headerName: "Name",
            minWidth: 150,
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),
            renderCell: (params) => {
              const name = params.value || "";
              return (
                <Typography
                  sx={{ height: "100%", display: "flex", alignItems: "center" }}
                >
                  {name?.charAt(0).toUpperCase() + name?.slice(1)}
                </Typography>
              );
            },
          },
          {
            field: "nickName",
            flex: 1.5,
            headerName: "Nick Name",
            minWidth: 140,
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),

            renderCell: (params) => {
              const nickName = params.value || "";
              return (
                <Typography
                  sx={{ height: "100%", display: "flex", alignItems: "center" }}
                >
                  {nickName?.charAt(0).toUpperCase() + nickName?.slice(1)}
                </Typography>
              );
            },
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
            minWidth: 110,
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
            minWidth: isMobile ? 130 : 60,
            headerAlign: isMobile ? "center" : "right",
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
                  justifyContent: isMobile ? "center" : "flex-end",
                  paddingRight: isMobile ? "0px" : "32px",
                  columnGap: "10px",
                  height: "100%",
                }}
              >
                <EditIcon
                  onClick={() => onEdit && onEdit(params.row)}
                  sx={{ cursor: "pointer", "&:hover": { color: "blue" } }}
                />
                {userRole === "admin" && (
                  <DeleteForeverIcon
                    onClick={() => onDelete && onDelete(params.row._id)}
                    sx={{ cursor: "pointer", "&:hover": { color: "red" } }}
                  />
                )}
              </div>
            ),
          },
        ]
      : [
          {
            field: "name",
            flex: 2,
            headerName: type === "senator" ? "Senator" : "Representative",
            minWidth: isMobile ? 180 : 150,
            maxWidth: isMobile ? 200 : undefined,
            minHeight: 200,
            headerAlign: "left",
            align: "left",
            renderHeader: (params) => (
              <Typography
                sx={{
                  paddingLeft: isMobile ? "12px" : "32px",
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
                  paddingLeft: isMobile ? "12px" : "32px",
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
                    width: isMobile ? 36 : 50,
                    height: isMobile ? 36 : 50,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `2px solid ${getBorderColor(params.row.party)}`,
                  }}
                >
                  <Avatar
                    src={
                      params.row.photo
                        ? `${API_URL}/images/${
                            type === "senator" ? "senator" : "house"
                          }/${params.row.photo}`
                        : "/default-avatar.png"
                    }
                    sx={{
                      width: isMobile ? 32 : 45,
                      height: isMobile ? 32 : 45,
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    transition: "color 0.3s ease-in-out",
                    "&:hover": {
                      color: getBorderColor(params.row.party),
                    },
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: isMobile ? "90px" : undefined,
                    minWidth: isMobile ? "40px" : undefined,
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
            headerName: "Rating",
            minHeight: 200,
            minWidth: 140,
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
                  minWidth: 140,
                  renderHeader: (params) => (
                    <Typography sx={{ fontWeight: "bold" }}>
                      {params.colDef.headerName}
                    </Typography>
                  ),

                  renderCell: (params) => {
                    const status = params?.row?.publishStatus;
                    const displayStatus = status
                      ? status
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(" ")
                      : "N/A";

                    return (
                      <Chip
                        label={displayStatus}
                        color={getStatusColor(status)}
                        variant="outlined"
                        size="small"
                      />
                    );
                  },
                },
              ]
            : [
                {
                  field: "publishStatus",
                  headerName: "Status",
                  minWidth: 140,
                  renderHeader: (params) => (
                    <Typography sx={{ fontWeight: "bold" }}>
                      {params.colDef.headerName}
                    </Typography>
                  ),
                  renderCell: (params) => {
                    const status = params?.row?.publishStatus;
                    const displayStatus = status
                      ? status
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(" ")
                      : "N/A";

                    return (
                      <Chip
                        label={displayStatus}
                        color={getStatusColor(status)}
                        variant="outlined"
                        size="small"
                      />
                    );
                  },
                },
              ]),

          {
            field: "action",
            headerName: "Action",
            minWidth: 140,
            headerAlign: "center",
            renderHeader: (params) => (
              <Typography sx={{ fontWeight: "bold" }}>
                {params.colDef.headerName}
              </Typography>
            ),
            renderCell: (params) => (
              <Box
                sx={{
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
                {userRole === "admin" && (
                  <DeleteForeverIcon
                    onClick={() => onDelete(params.row)}
                    sx={{ cursor: "pointer", "&:hover": { color: "red" } }}
                  />
                )}
              </Box>
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
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
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
        onRowSelectionModelChange={
          isSelectable
            ? (ids) => onSelectionChange && onSelectionChange(ids)
            : undefined
        }
        selectionModel={isSelectable ? selectedItems : []}
        sx={{
          ...(isMobile && {
            overflowX: "auto",
            width: "100vw",
            minWidth: 0,
            "& .MuiDataGrid-main": {
              minWidth: "600px",
            },
            "& .MuiDataGrid-columnHeader": {
              fontSize: "13px",
              padding: "4px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }),
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
